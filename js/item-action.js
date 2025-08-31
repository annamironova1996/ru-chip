if (typeof window.JItemAction === "undefined") {
  // class JItemAction
  JItemAction = function (node, config) {
    node =
      typeof node === "object" && node && node instanceof Node ? node : null;
    config = typeof config === "object" && config ? config : {};

    this.node = node;

    var _private = {
      inited: false,
    };

    // fields of this.config must be read only
    let _config = JSON.stringify(config);

    Object.defineProperties(this, {
      inited: {
        get: function () {
          return _private.inited;
        },
        set: function (value) {
          if (value) {
            _private.inited = true;
          }
        },
      },

      config: {
        get: function () {
          return JSON.parse(_config);
        },
      },
    });

    this.init();
  };

  JItemAction.prototype = {
    constructor: JItemAction,
    busy: false,
    parentNode: null,
    xhr: null,

    get class() {
      return this.constructor.name;
    },

    get action() {
      return "";
    },

    get requestUrl() {
      return arSiteOptions.SITE_DIR + "ajax/item.php";
    },

    get valid() {
      return this.node && this.action;
    },

    get idle() {
      return false;
    },

    activeStateClass: "active",

    get state() {
      return this.valid && BX.hasClass(this.node, this.activeStateClass);
    },

    set state(value) {
      if (this.valid) {
        if (value != this.state) {
          if (value) {
            BX.addClass(this.node, this.activeStateClass);
            // if (this.parentNode) {
              // BX.addClass(this.parentNode, this.activeStateClass);
            // }
          } else {
            BX.removeClass(this.node, this.activeStateClass);
            // if (this.parentNode) {
              // BX.removeClass(this.parentNode, this.activeStateClass);
            // }
          }

          if (this.switch) {
            this.switch.checked = value;
            BX.fireEvent(this.switch, "change");
          }

          let title = this.getStateTitle(value);
          this.node.setAttribute("title", title);

          let button = this.node.querySelector(".info-buttons__item-text");
          if (button) {
            button.setAttribute("title", title);
          }

          if (this.isActionRequiresTextChange()) {
            this.node.textContent = title;
          }
        }
      }
    },

    prevState: null,

    get data() {
      let data = {};

      if (this.valid) {
        let mainNode = "";
        if (this.node.classList.contains("js-external-button")) {
          mainNode = document.querySelector(".catalog-detail");
        } else {
          mainNode = this.node.closest(".js-popup-block");
        }

        if (mainNode) {
          let dataNode = mainNode.querySelector("[data-item]");
          if (dataNode) {
            if (typeof jQuery === "function") {
              data = jQuery(dataNode).data("item");
            } else {
              data = BX.data(dataNode, "item");
            }

            if (
              typeof data !== "undefined" &&
              typeof data !== "object" &&
              data
            ) {
              try {
                data = JSON.parse(data.toString());
              } catch (e) {
                data = {};
              }
            }
          }
        }
      }

      return typeof data === "object" && data ? data : {};
    },

    _switch: null,
    get switch() {
      if (!this._switch) {
        this._switch = this.getSwitch();
      }

      return this._switch;
    },

    init: function () {
      if (!this.inited) {
        this.inited = true;

        if (this.valid) {
          this.node.itemAction = this;
          this.parentNode = this.node.parentElement;

          this.bindEvents();
        }
      }
    },

    bindEvents: function () {
      if (this.valid) {
        if (BX.Type.isFunction(this.handlers.onChangeSwitch) && this.switch) {
          BX.bind(
            this.switch,
            "change",
            BX.proxy(this.handlers.onChangeSwitch, this)
          );
        }
      }
    },

    unbindEvents: function () {
      if (this.valid) {
        if (BX.Type.isFunction(this.handlers.onChangeSwitch) && this.switch) {
          BX.unbind(
            this.switch,
            "change",
            BX.proxy(this.handlers.onChangeSwitch, this)
          );
        }
      }
    },

    fireEvent: function (event) {
      if (this.valid && !this.busy && typeof event === "object" && event) {
        let eventType = event.type;
        if (eventType) {
          if (eventType === "click") {
            BX.proxy(this.handlers.onClickNode, this)(event);
          }
        }
      }
    },

    isStateChanged: function () {
      return this.prevState !== null && this.prevState != this.state;
    },

    getStateTitle: function (state) {
      if (this.valid) {
        if (state) {
          return this.node.getAttribute("data-title_added") || "";
        } else {
          return this.node.getAttribute("data-title") || "";
        }
      }

      return "";
    },

    getStateGoalCode: function (state) {
      return "goal_" + this.action + (state ? "_add" : "_remove");
    },

    showStateNotice: function (items, state) {
      if (this.valid && typeof JNoticeSurface === "function") {
        let surface = JNoticeSurface.get();
        let actionCapitalize = this.action.replace(/^\w/, (c) =>
          c.toUpperCase()
        );
        let noticeFunc = "onAdd2" + actionCapitalize;

        if (noticeFunc && typeof surface[noticeFunc] === "function") {
          surface[noticeFunc](items, state);
        }
      }
    },

    mkStateNoticeItems: function (data) {
      let items = [this.node];

      return items;
    },

    getCustomEventName: function (part) {
      if (this.action) {
        let actionCapitalize = this.action.replace(/^\w/, (c) =>
          c.toUpperCase()
        );
        let className = "JItemAction" + actionCapitalize;

        return (part ? part : "on") + className;
      }

      return "";
    },

    updateState: function (prevState) {
      if (this.valid) {
        if (this.xhr) {
          this.abortPrevRequest();
        }

        if (!this.busy) {
          this.node.blur();

          this.prevState =
            typeof prevState !== "undefined" ? prevState : this.state;

          if (this.idle) {
            if (this.parentNode) {
              BX.removeClass(this.parentNode, "loadings");
            }
          } else {
            this.busy = true;
            this.sendRequest();
          }
        }
      }
    },

    collectRequestData: async function () {
      let data = new FormData();

      data.set("is_ajax_post", "Y");
      data.set("sessid", BX.bitrix_sessid());
      data.set("lang", BX.message("LANGUAGE_ID"));
      data.set("action", this.action);
      data.set("state", this.state ? 1 : 0);
      data.set("SITE_ID", BX.message("SITE_ID"));
      let dataItem = this.data;
      if (dataItem) {
        data.set("ID", dataItem.ID);
        data.set("IBLOCK_ID", dataItem.IBLOCK_ID);
      }

      return data;
    },

    makeRequestConfig: async function () {
      return this.collectRequestData()
        .then(
          BX.proxy(function (data) {
            // fire event to customize data
            let eventName = this.getCustomEventName("onCollectRequestData");
            if (eventName) {
              BX.onCustomEvent(eventName, [
                {
                  action: this.action,
                  id: this.node.getAttribute("data-id"),
                  data: data,
                },
              ]);
            }

            let config = {
              url: this.requestUrl,
              data: data,
              method: "POST",
              dataType: "json",
              async: true,
              processData: true,
              preparePost: false,
              scriptsRunFirst: true,
              emulateOnload: true,
              start: true,
              cache: false,
            };

            return config;
          }, this)
        )
        .catch(function (error) {
          throw error;
        });
    },

    sendRequest: function () {
      if (this.valid) {
        this.makeRequestConfig()
          .then(
            BX.proxy(function (config) {
              config.onsuccess = BX.proxy(function (response) {
                if (this.xhr && this.xhr.status) {
                  // the request was not aborted
                  if (typeof this.onRequestSuccess === "function") {
                    this.onRequestSuccess(response);
                  }

                  if (typeof this.onRequestComplete === "function") {
                    this.onRequestComplete(config);
                  }
                }
              }, this);

              config.onfailure = BX.proxy(function () {
                if (typeof this.onRequestFailure === "function") {
                  this.onRequestFailure();
                }

                if (typeof this.onRequestComplete === "function") {
                  this.onRequestComplete(config);
                }
              }, this);

              this.xhr = BX.ajax(config);
            }, this)
          )
          .catch(
            BX.proxy(function (error) {
              setTimeout(
                BX.proxy(function () {
                  if (this.isStateChanged()) {
                    // toggle state back
                    this.state = this.prevState;
                    this.prevState = null;
                  }

                  if (this.parentNode) {
                    BX.removeClass(this.parentNode, "loadings");
                  }

                  this.busy = false;
                }, this),
                0
              );
            }, this)
          );
      }
    },

    onRequestComplete: function (config) {
      setTimeout(() => {
        if (this.parentNode) {
          BX.removeClass(this.parentNode, "loadings");
        }

        this.busy = false;
        this.xhr = null;
      }, 0);
    },

    onRequestSuccess: function (response) {
      let data = typeof response === "object" && response ? response : {};

      if (data.success) {
        if (this.action) {
          let actionUpper = this.action.toUpperCase();

          if (typeof arChipCounters !== "object") {
            arChipCounters = {};
          }

          if (typeof arChipCounters[actionUpper] !== "object") {
            arChipCounters[actionUpper] = {};
          }

          if ("items" in data) {
            arChipCounters[actionUpper].ITEMS = data.items;
          }

          if ("count" in data) {
            arChipCounters[actionUpper].COUNT = data.count;
          }

          if ("title" in data) {
            arChipCounters[actionUpper].TITLE = data.title;
          }

          // update badges
          if (
            this.class &&
            typeof window[this.class] === "function" &&
            typeof window[this.class].markBadges === "function"
          ) {
            window[this.class].markBadges();
          }

          let state = this.state;

          // mark items
          if (
            this.class &&
            typeof window[this.class] === "function" &&
            typeof window[this.class].markItems === "function"
          ) {
            window[this.class].markItems();
          }

          if (this.isStateChanged()) {
            let noticeItems = this.mkStateNoticeItems(data);

            // show notice
            if (
              typeof this.node.dataset.notice === "undefined" ||
              this.node.dataset.notice != false
            ) {
              this.showStateNotice(noticeItems, state);
            }

            // fire goal
            BX.onCustomEvent("onCounterGoals", [
              {
                goal: this.getStateGoalCode(state),
                params: {
                  id: this.node.getAttribute("data-id"),
                },
              },
            ]);
          }

          if ("reload" in data) {
            for (reloadAction in data.reload) {
              let reloadActionUpper = reloadAction.toUpperCase();

              if ("items" in data.reload[reloadAction]) {
                arChipCounters[reloadActionUpper].ITEMS =
                  data.reload[reloadAction].items;
              }

              if ("count" in data.reload[reloadAction]) {
                arChipCounters[reloadActionUpper].COUNT =
                  data.reload[reloadAction].count;
              }

              if ("title" in data.reload[reloadAction]) {
                arChipCounters[reloadActionUpper].TITLE =
                  data.reload[reloadAction].title;
              }

              let reloadActionCapitalize = reloadAction.replace(/^\w/, (c) =>
                c.toUpperCase()
              );
              let className = "JItemAction" + reloadActionCapitalize;
              if (typeof window[className] === "function") {
                // update badges
                if (
                  this.class &&
                  typeof window[className] === "function" &&
                  typeof window[className].markBadges === "function"
                ) {
                  window[className].markBadges();
                }

                // mark items
                if (
                  this.class &&
                  typeof window[className] === "function" &&
                  typeof window[className].markItems === "function"
                ) {
                  window[className].markItems();
                }
              }
            }
          }
        }
      } else {
        console.error(data.error);

        if (this.isStateChanged()) {
          // toggle state back
          this.state = this.prevState;
        }

        // show error notice
        if (typeof JNoticeSurface === "function") {
          let surface = JNoticeSurface.get();
          surface.onResultError(data);
        }
      }

      this.finalRequestActions();
    },

    onRequestFailure: function () {
      if (this.isStateChanged()) {
        // toggle state back
        this.state = this.prevState;
      }

      // show error notice
      if (typeof JNoticeSurface === "function") {
        let surface = JNoticeSurface.get();
        surface.onRequestError(this.xhr);
      }
    },

    abortPrevRequest: function () {
      if (this.xhr && this.busy) {
        this.xhr.abort();
        this.busy = false;
        this.xhr = null;
      }

      return this;
    },

    finalRequestActions: function () {
      if (this.valid && this.action !== "subscribe") {
        this.updateDropdownBlocks(this.action);
      }
    },

    updateDropdownBlocks: function (action) {
      if (!action) {
        action = "basket";
      }

      let blocks = Array.prototype.slice.call(
        document.querySelectorAll(`.${action}-dropdown`)
      );
      if (blocks.length) {
        for (let i in blocks) {
          BX.removeClass(blocks[i], "loaded");
        }
      }
    },

    getSwitch: function () {
      let actionSwitch = null;

      if (this.valid) {
        let dataItem = this.data;
        if (dataItem) {
          let id = dataItem.ID;
          if (id) {
            let parent = this.node;
            while (parent && !actionSwitch) {
              actionSwitch = parent.querySelector(
                '.js-item-action-switch[data-action="' +
                  this.action +
                  '"][data-id="' +
                  id +
                  '"]'
              );
              parent = parent.parentElement;
            }
          }
        }
      }

      return actionSwitch;
    },

    isActionRequiresTextChange: function () {
      return (
        BX.hasClass(this.node, "btn") &&
        !BX.hasClass(this.node, "item-action__inner--only-icon")
      );
    },

    handlers: {
      onClickNode: function (event) {
        if (!event) {
          event = window.event;
        }

        let target = event.target || event.srcElement;

        if (typeof target !== "undefined" && target) {
          if (this.valid) {
            // if (this.xhr) {
            // 	this.abortPrevRequest();
            // }

            if (!this.busy) {
              this.busy = true;

              this.node.blur();

              this.prevState = this.state;
              this.state = !this.state;

              if (this.idle) {
                if (this.parentNode) {
                  BX.removeClass(this.parentNode, "loadings");
                }

                this.busy = false;
              } else {
                this.sendRequest();
              }
            }
          }
        }
      },

      onChangeSwitch: function (event) {
        if (!event) {
          event = window.event;
        }

        let target = event.target || event.srcElement;

        if (typeof target !== "undefined" && target) {
          if (this.valid) {
          }
        }
      },
    },
  };

  // factory: returns a concrete JItemAction instance
  JItemAction.factory = function (node, config) {
    if (typeof node === "object" && node && node instanceof Node) {
      if (node.itemAction instanceof JItemAction) {
        return node.itemAction;
      } else {
        let action = (node.getAttribute("data-action") || "").trim();
        if (action) {
          let actionCapitalize = action.replace(/^\w/, (c) => c.toUpperCase());
          let className = "JItemAction" + actionCapitalize;
          if (typeof window[className] === "function") {
            return new window[className](node, config);
          }
        }
      }
    }

    return new window.JItemAction(node, config);
  };

  // setup active state for all current items
  JItemAction.markItems = function () {
    JItemActionBasket.markItems();
    JItemActionFavorite.markItems();
  };

  // set current count into badges
  JItemAction.markBadges = function () {
    JItemActionBasket.markBadges();
    JItemActionFavorite.markBadges();
  };

  // set actual states and badges
  JItemAction.actual = function () {
    JItemAction.markBadges();
    JItemAction.markItems();
  };

  // get and set actual states and badges
  JItemAction.reload = function () {
    BX.ajax({
      url: arSiteOptions.SITE_DIR + "ajax/actualBasket.php",
      data: {
        action: "reload",
        sessid: BX.bitrix_sessid(),
      },
      method: "POST",
      dataType: "html",
      async: true,
      processData: true,
      preparePost: true,
      scriptsRunFirst: true,
      emulateOnload: true,
      start: true,
      cache: false,
      onsuccess: function (data) {
        // fire action
        BX.onCustomEvent("onReloadCounters", [
          {
            data: data,
          },
        ]);
      },
    });
  };

  // class JItemActionFavorite
  JItemActionFavorite = function (node, config) {
    JItemAction.apply(this, arguments);
  };

  JItemActionFavorite.prototype = Object.create(JItemAction.prototype);
  JItemActionFavorite.prototype.constructor = JItemActionFavorite;
  Object.defineProperties(JItemActionFavorite.prototype, {
    action: {
      get() {
        return "favorite";
      },
    },
  });

  JItemActionFavorite.prototype.getStateGoalCode = function (state) {
    return "goal_wish" + (state ? "_add" : "_remove");
  };

  // set current count into badges
  JItemActionFavorite.markBadges = function () {
    if (
      typeof arChipCounters === "object" &&
      arChipCounters &&
      typeof arChipCounters.FAVORITE === "object" &&
      arChipCounters.FAVORITE &&
      typeof arChipCounters.FAVORITE.COUNT !== "undefined"
    ) {
      let blocks = Array.prototype.slice.call(
        document.querySelectorAll(".js-favorite-block")
      );
      if (blocks.length) {
        if (arChipCounters.FAVORITE.COUNT > 0) {
          for (let i in blocks) {
            BX.addClass(blocks[i], "icon-block-with-counter--count");
          }
        } else {
          for (let i in blocks) {
            BX.removeClass(blocks[i], "icon-block-with-counter--count");
          }
        }
      }

      blocks = Array.prototype.slice.call(
        document.querySelectorAll(".js-favorite-block .count")
      );
      if (blocks.length) {
        for (let i in blocks) {
          blocks[i].textContent = arChipCounters.FAVORITE.COUNT;
        }
      }
    }
  };

  // setup active state for all current items
  JItemActionFavorite.markItems = function () {
    if (
      typeof arChipCounters === "object" &&
      arChipCounters &&
      typeof arChipCounters.FAVORITE === "object" &&
      arChipCounters.FAVORITE &&
      typeof arChipCounters.FAVORITE.ITEMS === "object" &&
      arChipCounters.FAVORITE.ITEMS
    ) {
      let blocks = Array.prototype.slice.call(
        document.querySelectorAll(
          '.js-item-action.active[data-action="favorite"]'
        )
      );
      if (blocks.length) {
        let list = Object.values(arChipCounters.FAVORITE.ITEMS);
        for (let y in blocks) {
          let id = BX.data(blocks[y], "id");
          if (id && list.indexOf(id) == -1) {
            let itemAction =
              blocks[y].itemAction instanceof JItemAction
                ? blocks[y].itemAction
                : new this(blocks[y]);
            itemAction.state = false;
          }
        }
      }

      if (arChipCounters.FAVORITE.ITEMS) {
        for (let i in arChipCounters.FAVORITE.ITEMS) {
          let id = arChipCounters.FAVORITE.ITEMS[i];
          let blocks = Array.prototype.slice.call(
            document.querySelectorAll(
              '.js-item-action[data-action="favorite"][data-id="' +
                id + '"]:not(.active)'
            )
          );
          if (blocks.length) {
            for (let y in blocks) {
              let itemAction =
                blocks[y].itemAction instanceof JItemAction
                  ? blocks[y].itemAction
                  : new this(blocks[y]);
              itemAction.state = true;
            }
          }
        }
      }
    }
  };

  // class JItemActionBasket
  JItemActionBasket = function (node, config) {
    JItemAction.apply(this, arguments);
  };

  JItemActionBasket.prototype = Object.create(JItemAction.prototype);
  JItemActionBasket.prototype.constructor = JItemActionBasket;
  JItemActionBasket.prototype.basketPropsNode = null;
  Object.defineProperties(JItemActionBasket.prototype, {
    action: {
      get() {
        return "basket";
      },
    },

    state: {
      get() {
        return this.valid && BX.hasClass(this.node, this.activeStateClass);
      },
      set(value) {
        if (this.valid) {
          if (value != this.state) {
            if (value) {
              BX.addClass(this.node, this.activeStateClass);
              if (this.parentNode) {
                BX.addClass(this.parentNode, this.activeStateClass);
              }
            } else {
              BX.removeClass(this.node, this.activeStateClass);
              if (this.parentNode) {
                BX.removeClass(this.parentNode, this.activeStateClass);
              }
            }

            if (this.switch) {
              this.switch.checked = value;
              BX.fireEvent(this.switch, "change");
            }

            let title = this.getStateTitle(value);
            this.node.setAttribute("title", title);
            // this.node.innerHTML = title;

            let button = this.node.querySelector(".info-buttons__item-text");
            if (button) {
              button.setAttribute("title", title);
            }

            if (this.isActionRequiresTextChange()) {
              this.node.textContent = title;
            }
          }
        }
      },
    },

    quantity: {
      get() {
        if (this.valid) {
          let buyBlock = this.node.closest(".buy_block");
          if (buyBlock) {
            let input = buyBlock.querySelector(".in_cart .count-input");
            if (input) {
              return input.tagName === 'INPUT' ? input.value : parseInt(input.innerHTML);
            }
          }
        }

        return 1;
      },
      set(value) {
        if (this.valid) {
          this.node.setAttribute("data-quantity", value);

          let buyBlock = this.node.closest(".buy_block");
          if (buyBlock) {
            let input = buyBlock.querySelector(".in_cart .count-input");
            if (input) {
              if(input.tagName === 'INPUT')
              {
                  input.value = value;
              }
              else
              {
                  input.innerHTML = value;
              }
            }
          }
        }
      },
    },

    ratio: {
      get() {
        let ratio = 1;

        if (this.valid) {
          ratio = this.node.getAttribute("data-ratio") || 1;
        }

        if (ratio <= 0) {
          ratio = 1;
        }

        return ratio;
      },
    },

    minQuantity: {
      get() {
        let ratio = this.ratio;
        let minQuantity = ratio;

        if (this.valid) {
          minQuantity = this.node.getAttribute("data-min");
          if (minQuantity === null) {
            let counter = this.node.closest(".counter");
            if (counter) {
              let control = counter.querySelector(".counter__action--minus");
              if (control) {
                minQuantity = control.getAttribute("data-min");
              }
            }
          }

          if (minQuantity < ratio) {
            minQuantity = ratio;
          }
        }

        return minQuantity;
      },
    },

    maxQuantity: {
      get() {
        if (this.valid) {
          maxQuantity = this.node.getAttribute("data-max");
          if (maxQuantity === null) {
            let counter = this.node.closest(".counter");
            if (counter) {
              let control = counter.querySelector(".counter__action--plus");
              if (control) {
                maxQuantity = control.getAttribute("data-max");
              }
            }
          }
        }

        return maxQuantity;
      },
    },
  });

  JItemActionBasket.prototype.resetQuantity = function () {
    if (this.valid) {
      this.quantity = this.minQuantity || this.ratio;
    }
  };

  JItemActionBasket.prototype.getBasketPropsNode = function () {
    let basketPropsNode = null;

    if (this.valid) {
      let bakset_div = this.node.getAttribute("data-bakset_div") || "";
      if (bakset_div) {
        basketPropsNode = BX(bakset_div);
      }

      if (
        !basketPropsNode &&
        this.node.getAttribute("data-offers") !== "Y" &&
        this.node.closest(".grid-list__item")
      ) {
        basketPropsNode = this.node
          .closest(".grid-list__item")
          .querySelector(".basket_props_block");
      }
    }

    return basketPropsNode;
  };

  JItemActionBasket.prototype.collectRequestData = async function () {
    return JItemAction.prototype.collectRequestData.call(this, arguments).then(
      BX.proxy(function (data) {
        data.set("quantity", this.quantity);

        if (this.valid) {
          let offers =
            this.node.getAttribute("data-offers") === "Y" ? "Y" : "N";
          data.set("offers", offers);

          let add_props =
            this.node.getAttribute("data-add_props") === "Y" ? "Y" : "N";
          data.set("add_props", add_props);

          let part_props =
            this.node.getAttribute("data-part_props") === "Y" ? "Y" : "N";
          data.set("part_props", part_props);

          let props = this.node.getAttribute("data-props") || "";
          try {
            props = props.length ? props.split(";") : [];
          } catch (e) {
            props = [];
          }
          data.set("props", JSON.stringify(props));

          let ridItem = document.querySelector(".rid_item");
          let rid = ridItem
            ? ridItem.getAttribute("rid")
            : this.node.getAttribute("rid") || false;
          data.set("rid", rid);

          // collect basket props
          let foundValues = false;
          let basketPropsNode = this.getBasketPropsNode();
          if (basketPropsNode) {
            let propCollection = basketPropsNode.getElementsByTagName("select");
            if (!!propCollection && !!propCollection.length) {
              for (i = 0; i < propCollection.length; i++) {
                if (!propCollection[i].disabled) {
                  switch (propCollection[i].type.toLowerCase()) {
                    case "select-one":
                      data.set(propCollection[i].name, propCollection[i].value);
                      foundValues = true;
                      break;
                    default:
                      break;
                  }
                }
              }
            }

            propCollection = basketPropsNode.getElementsByTagName("input");
            if (!!propCollection && !!propCollection.length) {
              for (i = 0; i < propCollection.length; i++) {
                if (!propCollection[i].disabled) {
                  switch (propCollection[i].type.toLowerCase()) {
                    case "hidden":
                      data.set(propCollection[i].name, propCollection[i].value);
                      foundValues = true;
                      break;
                    case "radio":
                      if (propCollection[i].checked) {
                        data.set(
                          propCollection[i].name,
                          propCollection[i].value
                        );
                        foundValues = true;
                      }
                      break;
                    default:
                      break;
                  }
                }
              }
            }
          }

          if (!foundValues) {
            data.set("prop[0]", 0);
          }

          if (this.isStateChanged()) {
            let empty_props =
              this.node.getAttribute("data-empty_props") === "Y" ? "Y" : "N";
            if (empty_props === "N") {
              return this.showBasketPropsForm()
                .then(
                  BX.proxy(function (extData) {
                    if (
                      typeof extData === "object" &&
                      extData &&
                      extData instanceof FormData
                    ) {
                      for (let key of extData.keys()) {
                        data.set(key, extData.get(key));
                      }
                    }

                    return data;
                  }, this)
                )
                .catch(function (error) {
                  throw error;
                });
            }
          }
        }

        return data;
      }, this)
    );
  };

  JItemActionBasket.prototype.showBasketPropsForm = async function () {
    let that = this;

    return new Promise(
      BX.proxy(function (resolve, reject) {
        let trigger = BX.create({
          tag: "div",
          attrs: {
            "data-event": "jqm",
            "data-name": "message",
            "data-param-form_id": "message",
            "data-param-message_title": encodeURIComponent(
              BX.message("ADD_BASKET_PROPS_TITLE")
            ),
            "data-param-message_button_title": encodeURIComponent(
              BX.message("ADD_BASKET_PROPS_BUTTON_TITLE")
            ),
          },
        });

        BX.append(trigger, document.body);

        $(trigger).jqmEx(
          BX.proxy(function (name, hash, _this) {
            let popup = hash.w[0];
            let popupBody = popup.querySelector(".form-body");
            let popupButton = popup.querySelector(
              '.form-footer input[type="submit"]'
            );

            let basketPropsNode = this.getBasketPropsNode();
            if (basketPropsNode && popupBody) {
              popupBody.innerHTML = basketPropsNode.innerHTML;
            }

            BX.bind(
              popupButton,
              "click",
              BX.proxy(function () {
                let extData = new FormData();

                let propCollection = popup.getElementsByTagName("select");
                if (!!propCollection && !!propCollection.length) {
                  for (i = 0; i < propCollection.length; i++) {
                    if (!propCollection[i].disabled) {
                      switch (propCollection[i].type.toLowerCase()) {
                        case "select-one":
                          extData.set(
                            propCollection[i].name,
                            propCollection[i].value
                          );
                          break;
                        default:
                          break;
                      }
                    }
                  }
                }

                propCollection = popup.getElementsByTagName("input");
                if (!!propCollection && !!propCollection.length) {
                  for (i = 0; i < propCollection.length; i++) {
                    if (!propCollection[i].disabled) {
                      switch (propCollection[i].type.toLowerCase()) {
                        case "hidden":
                          extData.set(
                            propCollection[i].name,
                            propCollection[i].value
                          );
                          break;
                        case "radio":
                          if (propCollection[i].checked) {
                            extData.set(
                              propCollection[i].name,
                              propCollection[i].value
                            );
                          }
                          break;
                        default:
                          break;
                      }
                    }
                  }
                }

                resolve(extData);

                let closer = popup.querySelector(".jqmClose");
                if (closer) {
                  BX.fireEvent(closer, "click");
                } else {
                  let overlay =
                    popup.parentElement.querySelector(".jqmOverlay");
                  if (overlay) {
                    BX.fireEvent(overlay, "click");
                  } else {
                    popup.innerHTML = "";
                  }
                }
              }, this)
            );
          }, that),
          BX.proxy(function (name, hash, _this) {
            if (this.valid) {
              if (this.busy) {
                reject();
              }
            }
          }, that)
        );

        BX.fireEvent(trigger, "click");
        trigger.remove();
      }),
      that
    );
  };

  JItemActionBasket.prototype.onRequestSuccess = function (response) {
    JItemAction.prototype.onRequestSuccess.call(this, response);

    let blocks = Array.prototype.slice.call(
      document.querySelectorAll(".basket-dropdown")
    );
    if (blocks.length) {
      for (let i in blocks) {
        BX.removeClass(blocks[i], "loaded");
      }
    }
  };

  (JItemActionBasket.prototype.mkStateNoticeItems = function (data) {
    let items = JItemAction.prototype.mkStateNoticeItems.call(this, data);

    if ("changed_services" in data) {
      for (i in data.changed_services) {
        let serviceId = data.changed_services[i];
        let itemAction = JItemActionService.get(serviceId);
        if (itemAction) {
          items.push(itemAction.node);
        }
      }
    }

    return items;
  }),
    // set current count into badges
    (JItemActionBasket.markBadges = function () {
      if (
        typeof arChipCounters === "object" &&
        arChipCounters &&
        typeof arChipCounters.BASKET === "object" &&
        arChipCounters.BASKET &&
        typeof arChipCounters.BASKET.COUNT !== "undefined"
      ) {
        let blocks = Array.prototype.slice.call(
          document.querySelectorAll(".js-basket-block")
        );
        if (blocks.length) {
          if (arChipCounters.BASKET.COUNT > 0) {
            for (let i in blocks) {
              BX.addClass(blocks[i], "icon-block-with-counter--count");
              BX.removeClass(blocks[i], "header-cart__inner--empty");

              let title = blocks[i].closest("a");
              if (title) {
                blocks[i]
                  .closest("a")
                  .setAttribute("title", arChipCounters.BASKET.TITLE);
              }
            }
          } else {
            for (let i in blocks) {
              BX.removeClass(blocks[i], "icon-block-with-counter--count");
              BX.addClass(blocks[i], "header-cart__inner--empty");
            }
          }

          for (let i in blocks) {
            let title = blocks[i].closest("a");
            if (title) {
              title.setAttribute("title", arChipCounters.BASKET.TITLE);
            }
          }
        }

        blocks = Array.prototype.slice.call(
          document.querySelectorAll(".js-basket-block .count")
        );
        if (blocks.length) {
          for (let i in blocks) {
            blocks[i].textContent = arChipCounters.BASKET.COUNT;
          }
        }
      }
    });

  // setup active state for all current items
  JItemActionBasket.markItems = function () {
    if (
      typeof arChipCounters === "object" &&
      arChipCounters &&
      typeof arChipCounters.BASKET === "object" &&
      arChipCounters.BASKET &&
      typeof arChipCounters.BASKET.ITEMS === "object" &&
      arChipCounters.BASKET.ITEMS
    ) {
      // unset active state
      let blocks = Array.prototype.slice.call(
        document.querySelectorAll(
          '.js-item-action.active[data-action="basket"]'
        )
      );

      if (blocks.length) {
        let list = Object.keys(arChipCounters.BASKET.ITEMS);
        for (let y in blocks) {
          let id = BX.data(blocks[y], "id");
          if (id && list.indexOf(id) == -1) {
            let itemAction =
              blocks[y].itemAction instanceof JItemAction
                ? blocks[y].itemAction
                : new this(blocks[y]);
            itemAction.state = false;
            itemAction.resetQuantity();
          }
        }
      }

      if (arChipCounters.BASKET.ITEMS) {
        for (let i in arChipCounters.BASKET.ITEMS) {
          let id = i;
          let quantity = arChipCounters.BASKET.ITEMS[i];

          // update quantity
          blocks = Array.prototype.slice.call(
            document.querySelectorAll(
              '.js-item-action[data-action="basket"][data-id="' +
                id +
                '"].active'
            )
          );

          if (blocks.length) {
            for (let y in blocks) {
              let itemAction =
                blocks[y].itemAction instanceof JItemAction
                  ? blocks[y].itemAction
                  : new this(blocks[y]);
              itemAction.quantity = quantity;
            }
          }

          // set active state
          blocks = Array.prototype.slice.call(
            document.querySelectorAll(
              '.js-item-action[data-action="basket"][data-id="' +
                id +
                '"]:not(.active)'
            )
          );

          if (blocks.length) {
            for (let y in blocks) {
              let itemAction =
                blocks[y].itemAction instanceof JItemAction
                  ? blocks[y].itemAction
                  : new this(blocks[y]);
              itemAction.state = true;
              itemAction.quantity = quantity;
            }
          }
        }
      }
    }
  };

  // legacy: get and set actual states and badges
  if (!BX.Kdelo.Utils.isFunction("reloadCounters")) {
    reloadCounters = function () {
      JItemAction.reload();
    };
  }

  // bind handler for click on .js-item-action
  BX.bindDelegate(
    document,
    "click",
    {
      class: "js-item-action",
    },
    function (event) {
      if (!event) {
        event = window.event;
      }

      BX.PreventDefault(event);

      let target = event.target || event.srcElement;

      if (typeof target !== "undefined" && target) {
        if (!target.closest(".opt_action")) {
          JItemAction.factory(this).fireEvent(event);
        }
      }
    }
  );

  // bind handler for click on .js-item-action-switch
  BX.bindDelegate(
    document,
    "change",
    {
      tag: "input",
      className: "js-item-action-switch",
      attrs: {
        type: "checkbox",
      },
    },
    (event) => {
      event = event || window.event;
      let target = event.target;
      let bChecked = target.checked;

      let actionNode = null;
      let action = (target.getAttribute("data-action") || "").trim();
      if (action) {
        let parent = target;
        while (parent && !actionNode) {
          actionNode = parent.querySelector(
            '.js-item-action[data-action="' + action + '"]'
          );
          parent = parent.parentElement;
        }
      }

      if (actionNode) {
        let itemAction = JItemAction.factory(actionNode);
        if (itemAction) {
          itemAction.prevState = !bChecked;
          itemAction.state = bChecked;
          itemAction.updateState(!bChecked);
        }
      }
    }
  );

  // on complete loading content by ajax
  BX.addCustomEvent("onCompleteAction", function (eventdata) {
    try {
      if (
        eventdata.action === "ajaxContentLoaded" ||
        eventdata.action === "jsLoadBlock"
      ) {
        JItemAction.markItems();
      }
    } catch (e) {
      console.error(e);
    }
  });

  // on complete loading content by ajax on basket page
  BX.addCustomEvent("onAjaxSuccess", function (eventdata) {
    if (typeof eventdata === "object" && eventdata) {
      if (eventdata.BASKET_REFRESHED) {
        JItemAction.markItems();
        JItemAction.reload();
      }
    }
  });

  // set current items states
  readyDOM(function () {
    JItemAction.markItems();
  });
}
