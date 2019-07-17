// 主要参考自 https://github.com/Treora/dom-highlight-range

/**
 * 设置range范围高亮
 *
 * 首先把range范围的文本节点列出来，放入一个数组。然后对各个文本节点进行高亮处理
 *
 * @param range
 * @param color
 */
function setRangeHighlight(range, color) {
    if (range.collapsed) {
        return;
    }

    if (typeof color == 'undefined') {
        color = 'yellow'
    }

    let textNodes = getTextNodesInRange(range);

    // Remember range details to restore it later.
    let startContainer = range.startContainer;
    let startOffset = range.startOffset;
    let endContainer = range.endContainer;
    let endOffset = range.endOffset;

    let id = Date.now();
    console.log(id);
    for (let idx in textNodes) {
        highlightTextNode(textNodes[idx], color, id);
    }

    range.setStart(startContainer, startOffset);
    range.setEnd(endContainer, endOffset);
}


/**
 * 取消range范围高亮
 *
 * 抽取出文本节点, 然后替换掉原来的span父元素来达到取消高亮的效果
 * TODO 注意：有一个问题，取消高亮后被分离的文本节点没有自动合并，需要Node.normalize()处理, 这个逻辑不是看起来那么简单, 可能需要埋点做标记, 后面迭代再处理这个逻辑
 *
 * @param timestamp
 */
function unsetRangeHighlight(timestamp) {
    // 去除包裹的标签 remove wrapper
    highlight = document.querySelectorAll('span[data-hl-timestamp="' + timestamp + '"]');
    for (let i = 0; i < highlight.length; i++) {
        // console.log(highlight[i]);
        highlight[i].parentNode.insertBefore(highlight[i].firstChild, highlight[i]);
        highlight[i].remove();
    }
    window.getSelection().removeAllRanges();
}


/**
 * 获取range范围的文本节点
 *
 * 把range范围的文本节点压入到数组nodes中, 如果range范围的开头和结尾的只是占到容器的部分, 那么需要分离节点, 这样也埋下了一个伏笔, 就是
 * 当去除高亮时, 已经分离的节点不会自动合并为一个节点。注：splitText()函数返回的新建的节点, 而老节点变成了原来的一部分。
 *
 * @param range
 */
function getTextNodesInRange(range) {
    let nodes = [];

    if(range.collapsed) {
        return nodes;
    }

    // 当range范围的开头不是完整的一个文本节点时, 也即range范围只占一个完整的文本节点的一部分, 这个时候就需要分离文本节点为两个节点
    if (range.startOffset !== 0) {
        let createNode = range.startContainer.splitText(range.startOffset);

        if (range.endContainer === range.startContainer) {
            range.setEnd(createNode, range.endOffset - range.startOffset);
        }

        range.setStart(createNode, 0);
    }

    if (range.endOffset !== range.endContainer.length) {
        range.endContainer.splitText(range.endOffset);
    }

    // 创建节点迭代器, 把range区域的共同祖先赋值给这个迭代器;
    // 设置节点迭代器的起点和终点, 对应为range的起点和终点;
    // 把设置好起点和终点的节点迭代器push到一个数组
    // TODO 这里有一个地方要注意, 段落和段落之间, 莫名其妙有一个像回车换行一样的文本节点被创建了
    let root = range.commonAncestorContainer;
    let nodeIterator = document.createNodeIterator(root, NodeFilter.SHOW_TEXT);
    while (nodeIterator.referenceNode !== range.startContainer) {
        nodeIterator.nextNode();
    }
    while (nodeIterator.referenceNode !== range.endContainer) {
        nodes.push(nodeIterator.referenceNode);
        nodeIterator.nextNode();
    }
    nodes.push(range.endContainer);

    return nodes;
}


/**
 * 高亮文本节点
 *
 * some text
 * 替换为
 * <span class="hl-yellow" data-hl-timestamp="1562666410290">some text</span>
 * 其中 class="hl-yellow" 是为了高亮样式; data-hl-timestamp 是为了唯一标识这个文本, 这样方便如果有删除需要.
 *
 * @param textNode (文本节点)
 * @param color (高亮颜色)
 * @param id (传入的唯一识别该高亮的参数以便后续删除该高亮, 比如可以是时间戳)
 */
function highlightTextNode(textNode, color, id) {
    let span = document.createElement('span');
    span.setAttribute('data-hl-timestamp', id);
    span.setAttribute('data-hl-color', color);

    textNode.parentNode.replaceChild(span, textNode);
    span.appendChild(textNode);
}
