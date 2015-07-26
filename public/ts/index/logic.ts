import $ from "jquery"
import rivetsConfigs from "../../../libs/rivetsConfigs"
var rivets = rivetsConfigs.createDefault()
var t = {test: ["hello", "onthee", "a"]}
rivets.bind($('#app'), t)
