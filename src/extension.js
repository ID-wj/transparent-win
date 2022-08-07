// "onCommand:transparent-win.helloWorld"
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require('vscode');
const { getWindows, setWindowTransparent } = require('./handleOperation');

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed

/**
 *
 */
function activate() {
  setTransparent();
  vscode.workspace.onDidChangeConfiguration(() => {
    setTransparent();
  });
}

// this method is called when your extension is deactivated
function deactivate() {}

function getConfig() {
  return vscode.workspace.getConfiguration('transparent-win').transparency;
}

function convert(num) {
  if (typeof num !== 'number') {
    throw new Error(`${num} must be a number in 0.1 to 1`);
  }
  const MAXNUM = 255;
  const MINNUM = 26;
  if (num < 0.2) return MINNUM;
  else if (num > 255) return MAXNUM;
  return Math.abs(MAXNUM * num);
}

function setTransparent() {
  const transparency = convert(getConfig() || 0.9);
  getWindows().forEach((item) => {
    setWindowTransparent(item, transparency);
  });
}

module.exports = {
  activate,
  deactivate,
};
