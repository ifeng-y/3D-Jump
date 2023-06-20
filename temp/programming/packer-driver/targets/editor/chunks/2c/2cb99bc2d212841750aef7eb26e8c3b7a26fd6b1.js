System.register(["__unresolved_0", "cc", "__unresolved_1"], function (_export, _context) {
  "use strict";

  var _reporterNs, _cclegacy, __checkObsolete__, __checkObsoleteInNamespace__, _decorator, Component, Vec3, Input, Animation, Node, GameManager, _dec, _dec2, _dec3, _dec4, _dec5, _dec6, _class, _class2, _descriptor, _descriptor2, _descriptor3, _descriptor4, _descriptor5, _crd, ccclass, property, PlayerController;

  function _initializerDefineProperty(target, property, descriptor, context) { if (!descriptor) return; Object.defineProperty(target, property, { enumerable: descriptor.enumerable, configurable: descriptor.configurable, writable: descriptor.writable, value: descriptor.initializer ? descriptor.initializer.call(context) : void 0 }); }

  function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) { var desc = {}; Object.keys(descriptor).forEach(function (key) { desc[key] = descriptor[key]; }); desc.enumerable = !!desc.enumerable; desc.configurable = !!desc.configurable; if ('value' in desc || desc.initializer) { desc.writable = true; } desc = decorators.slice().reverse().reduce(function (desc, decorator) { return decorator(target, property, desc) || desc; }, desc); if (context && desc.initializer !== void 0) { desc.value = desc.initializer ? desc.initializer.call(context) : void 0; desc.initializer = undefined; } if (desc.initializer === void 0) { Object.defineProperty(target, property, desc); desc = null; } return desc; }

  function _initializerWarningHelper(descriptor, context) { throw new Error('Decorating class property failed. Please ensure that ' + 'proposal-class-properties is enabled and runs after the decorators transform.'); }

  function _reportPossibleCrUseOfGameManager(extras) {
    _reporterNs.report("GameManager", "./GameManager", _context.meta, extras);
  }

  return {
    setters: [function (_unresolved_) {
      _reporterNs = _unresolved_;
    }, function (_cc) {
      _cclegacy = _cc.cclegacy;
      __checkObsolete__ = _cc.__checkObsolete__;
      __checkObsoleteInNamespace__ = _cc.__checkObsoleteInNamespace__;
      _decorator = _cc._decorator;
      Component = _cc.Component;
      Vec3 = _cc.Vec3;
      Input = _cc.Input;
      Animation = _cc.Animation;
      Node = _cc.Node;
    }, function (_unresolved_2) {
      GameManager = _unresolved_2.GameManager;
    }],
    execute: function () {
      _crd = true;

      _cclegacy._RF.push({}, "d09edt2IERILJ4rtfbHB5rn", "PlayerController", undefined);

      __checkObsolete__(['_decorator', 'Component', 'Vec3', 'input', 'Input', 'EventMouse', 'Animation', 'SkeletalAnimation', 'EventTouch', 'Node']);

      ({
        ccclass,
        property
      } = _decorator);

      _export("PlayerController", PlayerController = (_dec = ccclass("PlayerController"), _dec2 = property(Node), _dec3 = property(Node), _dec4 = property(Node), _dec5 = property({
        type: Animation
      }), _dec6 = property({
        type: _crd && GameManager === void 0 ? (_reportPossibleCrUseOfGameManager({
          error: Error()
        }), GameManager) : GameManager
      }), _dec(_class = (_class2 = class PlayerController extends Component {
        constructor(...args) {
          super(...args);

          _initializerDefineProperty(this, "leftTouch", _descriptor, this);

          _initializerDefineProperty(this, "rightTouch", _descriptor2, this);

          _initializerDefineProperty(this, "midTouch", _descriptor3, this);

          _initializerDefineProperty(this, "BodyAnim", _descriptor4, this);

          // 关联 GameManager 组件
          _initializerDefineProperty(this, "gameMg", _descriptor5, this);

          // @property({type: SkeletalAnimation})
          // public CocosAnim: SkeletalAnimation|null = null;
          // for fake tween
          this._startJump = false;
          this._jumpStep = 0;
          this._curJumpTime = 0;
          this._jumpTime = 0.3;
          this._curJumpSpeed = 0;
          this._curPos = new Vec3();
          this._deltaPos = new Vec3(0, 0, 0);
          this._targetPos = new Vec3();
          this._curMoveIndex = 0;
        }

        start() {}

        reset() {
          this._curMoveIndex = 0;
        }

        setInputActive(active) {
          // if (active) {
          //     input.on(Input.EventType.MOUSE_UP, this.onMouseUp, this);
          // } else {
          //     input.off(Input.EventType.MOUSE_UP, this.onMouseUp, this);
          // }
          if (active) {
            this.leftTouch.on(Input.EventType.TOUCH_START, this.onTouchStart, this);
            this.rightTouch.on(Input.EventType.TOUCH_START, this.onTouchStart, this);
          } else {
            this.leftTouch.off(Input.EventType.TOUCH_START, this.onTouchStart, this);
            this.rightTouch.off(Input.EventType.TOUCH_START, this.onTouchStart, this);
          }
        }

        onTouchStart(event) {
          const target = event.target;

          if ((target == null ? void 0 : target.name) == 'LeftTouch') {
            this.jumpByStep(1);
          } else {
            this.jumpByStep(2);
          }
        } // onMouseUp(event: EventMouse) {
        //     if (event.getButton() === 0) {
        //         this.jumpByStep(1);
        //     } else if (event.getButton() === 2) {
        //         this.jumpByStep(2);
        //     }
        // }


        jumpByStep(step) {
          if (this._startJump) {
            return;
          }

          this._startJump = true;
          this._jumpStep = step;
          this._curJumpTime = 0;
          this._curJumpSpeed = this._jumpStep / this._jumpTime;
          this.node.getPosition(this._curPos);
          Vec3.add(this._targetPos, this._curPos, new Vec3(this._jumpStep, 0, 0)); // if (this.CocosAnim) {
          //     this.CocosAnim.getState('cocos_anim_jump').speed = 3.5; //跳跃动画时间比较长，这里加速播放
          //     this.CocosAnim.play('cocos_anim_jump'); //播放跳跃动画
          // }

          if (this.BodyAnim) {
            if (step === 1) {
              // this.BodyAnim.getState('oneStep').speed = 5;
              this.BodyAnim.play('oneStep');
            } else if (step === 2) {
              // this.BodyAnim.getState('twoStep').speed = 5;
              this.BodyAnim.play('twoStep');
            }
          }

          this._curMoveIndex += step;
        }

        onOnceJumpEnd() {
          // if (this.CocosAnim) {
          //     this.CocosAnim.play('cocos_anim_idle');
          // }
          this.node.emit('JumpEnd', this._curMoveIndex);
        }

        update(deltaTime) {
          if (this._startJump) {
            this._curJumpTime += deltaTime;

            if (this._curJumpTime > this._jumpTime) {
              // end
              this.node.setPosition(this._targetPos);
              this._startJump = false;
              this.onOnceJumpEnd();
            } else {
              // tween
              this.node.getPosition(this._curPos);
              this._deltaPos.x = this._curJumpSpeed * deltaTime;
              Vec3.add(this._curPos, this._curPos, this._deltaPos);
              this.node.setPosition(this._curPos);
            }
          }
        }

      }, (_descriptor = _applyDecoratedDescriptor(_class2.prototype, "leftTouch", [_dec2], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function () {
          return null;
        }
      }), _descriptor2 = _applyDecoratedDescriptor(_class2.prototype, "rightTouch", [_dec3], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function () {
          return null;
        }
      }), _descriptor3 = _applyDecoratedDescriptor(_class2.prototype, "midTouch", [_dec4], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function () {
          return null;
        }
      }), _descriptor4 = _applyDecoratedDescriptor(_class2.prototype, "BodyAnim", [_dec5], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function () {
          return null;
        }
      }), _descriptor5 = _applyDecoratedDescriptor(_class2.prototype, "gameMg", [_dec6], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function () {
          return null;
        }
      })), _class2)) || _class));

      _cclegacy._RF.pop();

      _crd = false;
    }
  };
});
//# sourceMappingURL=2cb99bc2d212841750aef7eb26e8c3b7a26fd6b1.js.map