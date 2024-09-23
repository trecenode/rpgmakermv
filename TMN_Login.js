//=============================================================================
// TMN_Login.js
// https://13node.com/rmmv-pantalla-de-login-con-api/
//=============================================================================

/*:
 *
 * @plugindesc Custom Login screen for RPG Maker MV
 * @author Danilo Ulloa 13Node.com
 *
 * @help This plugin creates a custom login screen for RPG Maker MV before the title screen. Originally created for 2MonkeysNetwork.com
 * 
 * @param Login URL
 * @default https://13node.com
 * @desc Select the URL for the login endpoint
 */
var loggedInUserEmail = null;

(function() {
    var parameters = PluginManager.parameters('TMN_Login');
    var loginURL = String(parameters['Login URL']);

    function Scene_Login() {
        this.initialize.apply(this, arguments);
    }

    Scene_Login.prototype = Object.create(Scene_Base.prototype);
    Scene_Login.prototype.constructor = Scene_Login;

    Scene_Login.prototype.initialize = function() {
        Scene_Base.prototype.initialize.call(this);
    };

    Scene_Login.prototype.create = function() {
        Scene_Base.prototype.create.call(this);
        this.createBackground();
        this.createLoginWindow();
    };

    Scene_Login.prototype.createBackground = function() {
        this._backgroundSprite = new Sprite();
        this._backgroundSprite.bitmap = ImageManager.loadTitle1($dataSystem.title1Name);
        this.addChild(this._backgroundSprite);
    };

    Scene_Login.prototype.switchActiveInput = function() {
        if (this._activeInput === this._usernameInput) {
            this.setActiveInput(this._passwordInput);
        } else {
            this.setActiveInput(this._usernameInput);
        }
    };

    Scene_Login.prototype.createLoginWindow = function() {
        const centerX = Graphics.width / 2;
        const centerY = Graphics.height / 2;
    
        this._usernameInput = new Window_LoginInput(centerX - 120, centerY - 60, '');
        if (this._usernameInput) {
            //console.log("Username input created.");
            this.addChild(this._usernameInput);
            this._usernameInput.setClickHandler(() => {
                this.setActiveInput(this._usernameInput);
            });
        } else {
            console.error("Failed to create username input.");
        }
    
        this._passwordInput = new Window_LoginInput(centerX - 120, centerY, '', true);
        if (this._passwordInput) {
            //console.log("Password input created.");
            this.addChild(this._passwordInput);
            this._passwordInput.setClickHandler(() => {
                this.setActiveInput(this._passwordInput);
            });
        } else {
            console.error("Failed to create password input.");
        }
    
        this._loginButton = new Window_CommandLogin(centerX - 120, centerY + 60);
        if (this._loginButton) {
            //console.log("Login button created.");
            this._loginButton.setHandler('login', this.performLogin.bind(this));
            this.addChild(this._loginButton);
        } else {
            console.error("Failed to create login button.");
        }
    
        this.setActiveInput(this._usernameInput);
    };
    
     Scene_Login.prototype.setActiveInput = function(input) {
        this._activeInput = input;
        this._usernameInput.deactivate();
        this._passwordInput.deactivate();
        input.activate();
    };

    Scene_Login.prototype.performLogin = function() {
        const username = this._usernameInput.text();
        const password = this._passwordInput.text();

        fetch(loginURL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email: username, password: password })
        })
        .then(response => response.json())
        .then(response => {
            if (response.code === 200) {
                loggedInUserEmail = username;
                // alert(response.message);
                SceneManager.goto(Scene_Title);
            } else {
                alert('Login failed. Please try again.');
                this._loginButton.activate(); 
            }
        }).catch(error => {
            //console.error("Login failed:", error);
            alert('Error during login. Please try again.');
            this._loginButton.activate(); 
        });
    };

    Scene_Login.prototype.update = function() {
        Scene_Base.prototype.update.call(this);
    };

    function Window_LoginInput() {
        this.initialize.apply(this, arguments);
    }

    Window_LoginInput.prototype = Object.create(Window_Base.prototype);
    Window_LoginInput.prototype.constructor = Window_LoginInput;

    Window_LoginInput.prototype.initialize = function(x, y, prompt, isPassword) {
        var width = 240;
        var height = this.fittingHeight(1);
        Window_Base.prototype.initialize.call(this, x, y, width, height);
        this._text = '';
        this._prompt = prompt;
        this._isPassword = isPassword || false;
        this._active = false;
        this.refresh();
        this.setClickHandler();
    };
    
    Window_LoginInput.prototype.setClickHandler = function() {
        this._windowSpriteContainer.interactive = true;
        this._windowSpriteContainer.on('pointerdown', () => {
            SceneManager._scene.setActiveInput(this);
        });
    };
    
    Window_LoginInput.prototype.onClick = function() {
        SceneManager._scene.setActiveInput(this);
    };
    
    Window_LoginInput.prototype.refresh = function() {
        this.contents.clear();
        this.drawText(this._prompt, 0, 0, this.contentsWidth(), 'left');
        var displayText = this._isPassword ? '*'.repeat(this._text.length) : this._text;
        //var displayText = this._text;
        this.drawText(displayText, 0, 0, this.contentsWidth(), 'right');
    };
    
    Window_LoginInput.prototype.text = function() {
        return this._text;
    };

    Window_LoginInput.prototype.activate = function() {
        this._active = true;
    };

    Window_LoginInput.prototype.deactivate = function() {
        this._active = false;
    };
    
    Window_LoginInput.prototype.processHandling = function() {
        if (this.isOpenAndActive()) {
            if (Input.isRepeated('ok')) {
                this.processOk();
            }
            if (Input.isRepeated('backspace')) {
                this.processBackspace();
            }
            if (Input.isRepeated('cancel')) {
                this.processCancel();
            }
        }
    };
    
    Window_LoginInput.prototype.processOk = function() {
        // OK input
    };
    
    Window_LoginInput.prototype.processBackspace = function() {
        if (this._text.length > 0) {
            this._text = this._text.slice(0, -1);
            this.refresh();
        }
    };
    
    Window_LoginInput.prototype.processCancel = function() {
        // Cancel input
    };
    
    Window_LoginInput.prototype.update = function() {
        Window_Base.prototype.update.call(this);
        this.processHandling();
    };
    
    Window_LoginInput.prototype.charWidth = function() {
        var text = 'A';
        return this.textWidth(text);
    };
    
    Window_LoginInput.prototype.processCharacter = function(character) {
        if (this._text.length < this.maxLength()) {
            this._text += character;
            this.refresh();
        }
    };
    
    Window_LoginInput.prototype.maxLength = function() {
        return 20;
    };
    
    Window_LoginInput.prototype.isOpenAndActive = function() {
        return this.isOpen() && this.active;
    };
    
    Window_LoginInput.prototype.onKeyDown = function(event) {
        if (this.isOpenAndActive()) {
            let character = null;
            if (event.key.length === 1) {
                character = event.key;
            } else if (event.key === 'Backspace') {
                this.processBackspace();
                return;
            }
    
            if (character) {
                this.processCharacter(character);
            }
        }
    };
    
    document.addEventListener('keydown', function(event) {
        if (SceneManager._scene instanceof Scene_Login) {
            if (SceneManager._scene._activeInput) {
                if (event.key === "Tab") {
                    event.preventDefault(); // Prevent default tab behavior
                    SceneManager._scene.switchActiveInput();
                } else {
                    SceneManager._scene._activeInput.onKeyDown(event);
                }
            }
        }
    });

    function Window_CommandLogin() {
        this.initialize.apply(this, arguments);
    }

    Window_CommandLogin.prototype = Object.create(Window_Command.prototype);
    Window_CommandLogin.prototype.constructor = Window_CommandLogin;

    Window_CommandLogin.prototype.initialize = function(x, y) {
        Window_Command.prototype.initialize.call(this, x, y);
    };

    Window_CommandLogin.prototype.makeCommandList = function() {
        this.addCommand('Login', 'login');
    };

    const _Scene_Boot_start = Scene_Boot.prototype.start;
    
    Scene_Boot.prototype.start = function() {
        _Scene_Boot_start.call(this);
        SceneManager.gotoLoginScene();
    };

    SceneManager.gotoLoginScene = function() {
        SceneManager.goto(Scene_Login);
    };

})();