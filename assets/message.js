Game.Message = {
  attr: {
    freshMessagesReverseQueue: [],
    staleMessagesQueue: [],
    archivedMessagesQueue: [],
    archiveMessageLimit: 200,
    messageTimeoutQueue: [],
    relevantTime: 1500
  },
  renderOn: function (display) {
    //console.dir(this.attr);
    display.clear();
    var dispRowMax = display._options.height - 1;
    var dispColMax = display._options.width - 2;
    var dispRow = 0;
    var freshMsgIdx = 0;
    var staleMsgIdx = 0;
    // fresh messages in white
    for (freshMsgIdx = 0; freshMsgIdx < this.attr.freshMessagesReverseQueue.length && dispRow < dispRowMax; freshMsgIdx++) {
      dispRow += display.drawText(1,dispRow,'%c{#fff}%b{#000}'+this.attr.freshMessagesReverseQueue[freshMsgIdx]+'%c{}%b{}',79);
    }
    // stale messages in grey
    for (staleMsgIdx = 0; staleMsgIdx < this.attr.staleMessagesQueue.length && dispRow < dispRowMax; staleMsgIdx++) {
      dispRow += display.drawText(1,dispRow,'%c{#aaa}%b{#000}'+this.attr.staleMessagesQueue[staleMsgIdx]+'%c{}%b{}',79);
    }
  },
  ageMessages:function (lastStaleMessageIdx) {
    while (this.attr.freshMessagesReverseQueue.length > lastStaleMessageIdx) {
      this.attr.staleMessagesQueue.unshift(this.attr.freshMessagesReverseQueue.pop());
    }
    // archive any additional stale messages that didn't get shown
    while (this.attr.staleMessagesQueue.length > lastStaleMessageIdx) {
      this.attr.archivedMessagesQueue.unshift(this.attr.staleMessagesQueue.pop());
    }
    // just dump messages that are too old for the archive
    while (this.attr.staleMessagesQueue.length > this.attr.archiveMessageLimit) {
      this.attr.archivedMessagesQueue.pop();
    }
    // move fresh messages to stale messages
    if (this.attr.freshMessagesReverseQueue.length > 0) {
      this.attr.staleMessagesQueue.unshift(this.attr.freshMessagesReverseQueue.pop());
    }
  },
  send: function (msg) {
    this.attr.freshMessagesReverseQueue.push(msg); // new messages get added to the end of the fresh message queue so that sequential things are in the right order (e.g. you hit the goblin, you kill the goblin)
    message = this;
    this.attr.messageTimeoutQueue.unshift(setTimeout(function () {message.ageMessages(5);}, this.attr.relevantTime));
    while(this.attr.messageTimeoutQueue.length > 5) {
      clearTimeout(this.attr.messageTimeoutQueue.pop());
    }
    Game.renderMessage();
  },
  clear: function () {
    this.attr.freshMessagesReverseQueue = [];
    this.attr.staleMessagesQueue = [];
  },
  getArchives: function () {
    return this.attr.archivedMessagesQueue;
  },
  getArchiveMessageLimit: function () {
    return this.attr.archiveMessageLimit;
  },
  setArchiveMessageLimit: function (n) {
    this.attr.archiveMessageLimit = n;
  }
};
