import React, { Component } from 'react';
import classNames from 'classnames';
import PropTypes from 'prop-types';

export default class Notice extends Component {
  static propTypes = {
    duration: PropTypes.number,//持续时间
    onClose: PropTypes.func,
    children: PropTypes.any,
  };

  static defaultProps = {
    onEnd() {
    },
    onClose() {
    },
    duration: 1.5,
    style: {
      right: '50%',
    },
  };

  componentDidMount() {
    if (this.props.duration) {//设置持续时间后才可以执行定时器
      this.closeTimer = setTimeout(() => {//什么时候吧自己给关闭
        this.close();
      }, this.props.duration * 1000);
    }
  }

  componentWillUnmount() {//组件卸载时关闭并释放定时器
    this.clearCloseTimer();
  }

  clearCloseTimer = () => {//去掉自动关闭并取消定时器
    if (this.closeTimer) {
      clearTimeout(this.closeTimer);
      this.closeTimer = null;
    }
  }

  close = () => {//关闭本次notice
    this.clearCloseTimer();
    this.props.onClose();
  }

  render() {
    const props = this.props;
    const componentClass = `${props.prefixCls}-notice`;
    const className = {
      [`${componentClass}`]: 1,
      [`${componentClass}-closable`]: props.closable,//能不能手动关闭
      [props.className]: !!props.className,//自定义class
    };
    return (
      <div className={classNames(className)} style={props.style}>
        <div className={`${componentClass}-content`}>{props.children}</div>
        {props.closable ?
          <a tabIndex="0" onClick={this.close} className={`${componentClass}-close`}>
            <span className={`${componentClass}-close-x`}></span>
          </a> : null
        }
      </div>
    );
  }
}
