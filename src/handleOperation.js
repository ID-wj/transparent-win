const ref = require('ref-napi');
const ffi = require('ffi-napi');

const voidPtr = ref.refType(ref.types.void);
const stringPtr = ref.refType(ref.types.CString);

const user32 = ffi.Library('user32.dll', {
  EnumWindows: ['bool', [voidPtr, 'int32']],
  GetWindowTextA: ['long', ['long', stringPtr, 'long']],
  GetWindowLongA: ['long', ['long', 'int32']],
  SetWindowLongA: ['uint32', ['long', 'int32', 'long']],
  SetLayeredWindowAttributes: ['bool', ['long', 'uint32', 'byte', 'uint32']],
});

let windows = [];
const windowProc = ffi.Callback(
  'bool',
  ['long', 'int32'],
  function (hwnd, lParam) {
    let buf, name, ret;
    buf = Buffer.alloc(255);
    // @ts-ignore
    ret = user32.GetWindowTextA(hwnd, buf, 255);
    name = ref.readCString(buf, 0);
    if (!name || !name.length || !/ - Visual Studio Code?$/.test(name)) {
      return true;
    }
    windows.push(hwnd);
    return true;
  }
);

exports.getWindows = function () {
  windows = [];
  // @ts-ignore
  user32.EnumWindows(windowProc, 0);
  return windows;
};

exports.setWindowTransparent = function (hwnd, transNum) {
  //User32.dll增加了一个新函数SetLayeredWindowAttributes。
  //要使用该函数，我们必须在生成窗口或使用SetWindowLong函数中设置窗口风格WS_EX_LAYERED (0x8)。该风格一旦被设置，我们就可以调用该函数来透明化窗口
  const WS_EX_LAYERED = 0x80000;
  const GWL_EXSTYLE = -20; //-20的意思是扩展样式 https://docs.microsoft.com/en-us/windows/win32/api/winuser/nf-winuser-setwindowlonga
  const LWA_ALPHA = 0x2;
  const winLong = user32.GetWindowLongA(hwnd, GWL_EXSTYLE);
  // @ts-ignore
  user32.SetWindowLongA(hwnd, GWL_EXSTYLE, winLong | WS_EX_LAYERED);
  return user32.SetLayeredWindowAttributes(hwnd, 0, transNum, LWA_ALPHA); //LWA_ALPHA=2使用bAlpha来确定分层窗口的不透明度
};
