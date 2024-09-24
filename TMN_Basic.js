//=============================================================================
// TMN_Basic.js
// 13Node.com
// Licensed under MIT
//=============================================================================

(function() {

   /* Make Game Full Screen of your browser */
   var _Scene_Base_create = Scene_Base.prototype.create;
  
   Scene_Base.prototype.create = function() {
    _Scene_Base_create.call(this);
    Graphics.width = window.innerWidth;
    Graphics.height = window.innerHeight;
    Graphics.boxWidth = window.innerWidth;
    Graphics.boxHeight = window.innerHeight;
   };


   
  })()