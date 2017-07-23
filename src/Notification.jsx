import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ReactDOM from 'react-dom';
import Animate from 'rc-animate';
import createChainedFunction from 'rc-util/lib/createChainedFunction';
import classnames from 'classnames';
import Notice from './Notice';

let seed = 0;
const now = Date.now();

function getUuid() {//生产唯一值
  return `rcNotification_${now}_${seed++}`;
}

class Notification extends Component {
  static propTypes = {//需要拿到的属性类型
    prefixCls: PropTypes.string,
    transitionName: PropTypes.string,
    animation: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
    style: PropTypes.object,
  };

  static defaultProps = {//默认属性
    prefixCls: 'rc-notification',// css class 前缀，    目的是方便修改样式（这个参数增加了样式的灵活性）
    animation: 'fade',//动画
    style: {//默认css样式
      top: 65,
      left: '50%',
    },
  };

  state = {//组件状态
    notices: [],
  };

  getTransitionName() {//得到过度动画的名字       做一个优先级，   有transitionName就用，没有就用默认的animation
    const props = this.props;
    let transitionName = props.transitionName;
    if (!transitionName && props.animation) {
      transitionName = `${props.prefixCls}-${props.animation}`;
    }
    return transitionName;
  }

  add = (notice) => {
    const key = notice.key = notice.key || getUuid();//指定notice的id             这个key 其实最主要是对动画有用的
    this.setState(previousState => {//这个     传入一个回调函数的形式  previousState表示前一个state
      const notices = previousState.notices;
      if (!notices.filter(v => v.key === key).length) {//包括这个key的对象没有存过的时候 才改变state
        return {
          notices: notices.concat(notice),//给数组增加一个值，即修改了状态
        };
      }
    });
  }

  remove = (key) => {//移除指定key的notice
    this.setState(previousState => {
      return {
        notices: previousState.notices.filter(notice => notice.key !== key),
      };
    });
  }

  render() {
    const props = this.props;
    const noticeNodes = this.state.notices.map((notice) => {
      //创建一个函数，它将从左到右调用所有函数的参数。
      const onClose = createChainedFunction(this.remove.bind(this, notice.key), notice.onClose);
      return (<Notice
        prefixCls={props.prefixCls}
        {...notice}
        onClose={onClose}
      >
        {notice.content}
      </Notice>);
    });
    const className = {
      [props.prefixCls]: 1,
      [props.className]: !!props.className,
    };
    return (
      <div className={classnames(className)} style={props.style}>
        <Animate transitionName={this.getTransitionName()}>{noticeNodes}</Animate>
      </div>
    );
  }
}

Notification.newInstance = function newNotificationInstance(properties) {//为这个react组件添加一个类方法
  const { getContainer, ...props } = properties || {};//拿到默认参数
  let div;
  if (getContainer) {
    div = getContainer();//用户自己指定包裹层
  } else {
    div = document.createElement('div');
    document.body.appendChild(div);
  }
  const notification = ReactDOM.render(<Notification {...props} />, div); //这样其实已经对组件渲染了   组件有状态时返回一个refs，无状态时返回一个null
  return {
    notice(noticeProps) {
      notification.add(noticeProps);
    },
    removeNotice(key) {//根据key手动移除 某个notice
      notification.remove(key);
    },
    component: notification,
    destroy() {//卸载它
      ReactDOM.unmountComponentAtNode(div);
      document.body.removeChild(div);
    },
  };
};

export default Notification;
