# Usage
## Step 1
双击index.html, 在浏览器中打开该文件
## Step 2
用鼠标开始选中一些文本
## Step 3
打开浏览器的开发者工具, 在控制台中输入
```
sel = window.getSelection();
range = sel.getRangeAt(0);
setRangeHighlight(range);
sel.removeAllRanges();
```
此时可以看到鼠标选中的文本被高亮，并且控制台输出了一串时间戳
## Step 4
在控制台敲入：
```
unsetRangeHighlight(1562665584608);
```
注把1562665584608替换为Step 3中的控制台得到的时间戳

（完）
