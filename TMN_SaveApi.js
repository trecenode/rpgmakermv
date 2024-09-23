//=============================================================================
// TMN_SaveAPI.js
//=============================================================================

/*:
 * @plugindesc Custom Save and Load using API for RPG Maker MV
 * @param SaveURL
 * @text Save URL
 * @desc The URL for the save endpoint
 * @default https://13node.com/api/save
 *
 * @param LoadURL
 * @text Load URL
 * @desc The URL for the load endpoint
 * @default https://13node.com/api/load
 * 
 * @help This plugin overrides the default save and load functionality to use an API.
 */

(function() {
    var parameters = PluginManager.parameters('TMN_SaveAPI');
    var saveURL = String(parameters['SaveURL']);
    var loadURL = String(parameters['LoadURL']);

    // General functions
    Window_TitleCommand.prototype.makeCommandList = function() {
        this.addCommand(TextManager.newGame,   'newGame');
        this.addCommand(TextManager.continue_, 'continue', this.isContinueEnabled());
        // this.addCommand(TextManager.options,   'options');
    };
    
    Window_MenuCommand.prototype.addOptionsCommand = function() {
    };

    DataManager.maxSavefiles = function() {
        return 1;
    };

    // Functions for Save From API
    function saveGameToAPI(savedata) {
        return fetch(saveURL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email: loggedInUserEmail, save: savedata })
        })
        .then(response => response.json())
        .then(data => {
            if (data.code === 200) {
                console.log('Game saved successfully');
                $gameSystem.onBeforeSave();
                DataManager.saveGame(1);
                SceneManager.push(Scene_Map);
                SoundManager.playSave();
            } else {
                console.error('Failed to save game:', data.message);
            }
        })
        .catch(error => {
            console.error('Error saving game:', error);
        });
    }

    var _Scene_Save_create = Scene_Save.prototype.create;
    Scene_Save.prototype.create = function() {
        _Scene_Save_create.call(this);
        const json = JsonEx.stringify(DataManager.makeSaveContents());
        const savedata = LZString.compressToBase64(json);
        saveGameToAPI(savedata);
    };
    Scene_Save.prototype.start = function() {
        Scene_MenuBase.prototype.start.call(this);
        $gameSystem.onBeforeSave();
        DataManager.saveGame(1);
        SceneManager.push(Scene_Map);
        SoundManager.playSave();
    };

    // TODO: Create a new save scene/window
    //Scene_File.prototype.createListWindow = function() {

    //};

    // Functions for Load From API
    function loadGameFromAPI() {
        return fetch(loadURL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email: loggedInUserEmail })
        })
        .then(response => response.json())
        .then(data => {
            if (data.code === 200) {
                if (data.save){
                    StorageManager.saveToWebStorage(1, LZString.decompressFromBase64(data.save));
                    localStorage.setItem('RPG Global', 'NoOwrgNhA0DeBEBzCB7ARgQwgSQCbwC54AlABQHEBZANXmngBcBLBiAU0PmxAGcGMATgAIA6igERcBIQBFBAayEBlFCBAd6AYwAWgjJoZsBPQsGDxS++RkRsAjHQAMAXWf0AZvrYmCZi1Zt7J1d6AAcIDABPZgBbDiJHRwJE5IBmOkYmOL4MGNDCOwB2ACZCu1LUxwAWOyrigF9nIAA=');
                    DataManager.loadGame(1);
                    $gameSystem.onAfterLoad();
                    SceneManager.goto(Scene_Map);
                } else {
                    this.checkPlayerLocation();
                    DataManager.setupNewGame();
                    SceneManager.goto(Scene_Map);
                }
            } else {
                console.error('Failed to load game:', data.message);
                return null;
            }
        })
        .catch(error => {
            console.error('Error loading game:', error);
            return null;
        });
    }

    const _Scene_Title_create = Scene_Title.prototype.create;
    Scene_Title.prototype.create = function() {
        _Scene_Title_create.call(this);
        if (loggedInUserEmail) {
            loadGameFromAPI();
        }
    };

})();