import $ = require("jquery")
import rivetsConfigs = require("../../../libs/rivetsConfigs");
var rivets = rivetsConfigs.createDefault()
var t = {test: ["hello", "onthee", "a"]}
rivets.bind($('#app'), t)
