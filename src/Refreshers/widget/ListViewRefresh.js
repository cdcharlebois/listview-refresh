import {
    defineWidget,
    log,
    runCallback,
} from 'widget-base-helpers';
import './ListViewRefresh.scss';
import aspect from 'aspect-js';

export default defineWidget('ListViewRefresh', false, {

    waitTime: null,
    height: null,
    isChat: null,
    _obj: null,
    _interval: null,
    _prior: null,
    _nodes: null,
    _listview: null,

    constructor() {
        this.log = log.bind(this);
        this.runCallback = runCallback.bind(this);
        // this._onListviewUpdate = _onListviewUpdate.bind(this);
        // this._attachToListView = _attachToListView.bind(this);
        // this._moveLoadMoreButtion = _moveLoadMoreButtion.bind(this);
    },
    /**
     * @description waits for the listview to be defined and then triggers the setup function
     * 
     */
    postCreate() {
        var wait = setInterval(() => {
            if (this.domNode &&
                this.domNode.parentElement &&
                this.domNode.parentElement.querySelector(".mx-listview")) {
                console.log("Found nodes.");
                this._nodes = {};
                this._nodes.listview = this.domNode.parentElement.querySelector(".mx-listview");
                this._nodes.button = this._nodes.listview.querySelector("button");
                this._listview = dijit.registry.byNode(this._nodes.listview);
                this._attachToListView();
                clearInterval(wait);
            }
        }, 100);
    },

    _attachToListView() {
        const lv = this._nodes.listview,
            listview = this._listview;
        // set the height
        lv.style.height = this.height + "px";
        // if it's set to chat, add the class, scroll to bottom, and move the button (if it exists)
        if (this.isChat) {
            lv.classList.add("mx-chat");
            this._prior = 0;
            aspect.after(this._listview, "_onLoad", this._onListviewUpdate.bind(this));
            this._interval = setInterval(() => {
                listview.sequence(["_sourceReload", "_renderData", "_onLoad"]);
            }, this.waitTime * 1000);
            setTimeout(() => {
                lv.scrollTop = lv.scrollHeight;
            }, 200);
        }
    },

    _moveLoadMoreButtion() {
        const lv = this._nodes.listview,
            button = this._nodes.button;
        if (button) {
            lv.insertBefore(button, lv.firstChild);
        }
    },

    _onListviewUpdate() {
        const lv = this._nodes.listview,
            listview = this._listview;
        this._moveLoadMoreButtion();
        console.debug(`Prior: ${this._prior} | New: ${listview._datasource._setSize}`);
        // if there are new messages
        if (listview._datasource._setSize > this._prior) {
            this._prior = listview._datasource._setSize;
            lv.scrollTop = lv.scrollHeight;
        }
    },

    uninitialize() {
        clearInterval(this._interval);
    }
});