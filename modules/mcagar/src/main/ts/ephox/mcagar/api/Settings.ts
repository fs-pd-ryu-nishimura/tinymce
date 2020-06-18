/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Editor } from '../alien/EditorTypes';

const getToolbarMode = (editor: Editor) => editor.getParam('toolbar_mode');

const getToolbarDrawer = (editor: Editor) => editor.getParam('toolbar_drawer');

export {
  getToolbarMode,
  getToolbarDrawer
};