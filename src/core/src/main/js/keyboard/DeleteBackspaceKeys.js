/**
 * DeleteBackspaceKeys.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

define(
  'tinymce.core.keyboard.DeleteBackspaceKeys',
  [
    'ephox.katamari.api.Arr',
    'tinymce.core.delete.BlockBoundaryDelete',
    'tinymce.core.delete.BlockRangeDelete',
    'tinymce.core.delete.CefDelete',
    'tinymce.core.delete.InlineBoundaryDelete',
    'tinymce.core.keyboard.MatchKeys',
    'tinymce.core.util.VK'
  ],
  function (Arr, BlockBoundaryDelete, BlockRangeDelete, CefDelete, BoundaryDelete, MatchKeys, VK) {
    var action = function (f) {
      var args = Array.prototype.slice.call(arguments, 1);
      return function () {
        return f.apply(null, args);
      };
    };

    var setupKeyDownHandler = function (editor, caret) {
      editor.on('keydown', function (evt) {
        var matches = MatchKeys.match([
          { keyCode: VK.BACKSPACE, action: action(BoundaryDelete.backspaceDelete, editor, caret, false) },
          { keyCode: VK.DELETE, action: action(BoundaryDelete.backspaceDelete, editor, caret, true) },
          { keyCode: VK.BACKSPACE, action: action(CefDelete.backspaceDelete, editor, false) },
          { keyCode: VK.DELETE, action: action(CefDelete.backspaceDelete, editor, true) },
          { keyCode: VK.BACKSPACE, action: action(BlockRangeDelete.backspaceDelete, editor, false) },
          { keyCode: VK.DELETE, action: action(BlockRangeDelete.backspaceDelete, editor, true) },
          { keyCode: VK.BACKSPACE, action: action(BlockBoundaryDelete.backspaceDelete, editor, false) },
          { keyCode: VK.DELETE, action: action(BlockBoundaryDelete.backspaceDelete, editor, true) }
        ], evt);

        Arr.find(matches, function (pattern) {
          return pattern.action();
        }).each(function (_) {
          evt.preventDefault();
        });
      });
    };

    var setupKeyUpHandler = function (editor) {
      editor.on('keyup', function (evt) {
        var matches = MatchKeys.match([
          { keyCode: VK.BACKSPACE, action: action(CefDelete.paddEmptyElement, editor) },
          { keyCode: VK.DELETE, action: action(CefDelete.paddEmptyElement, editor) }
        ], evt);

        Arr.find(matches, function (pattern) {
          return pattern.action();
        });
      });
    };

    var setup = function (editor, caret) {
      setupKeyDownHandler(editor, caret);
      setupKeyUpHandler(editor);
    };

    return {
      setup: setup
    };
  }
);
