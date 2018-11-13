/**
 * Custom WebView with autoHeight feature
 *
 * @prop source: Same as WebView
 * @prop autoHeight: true|false
 * @prop defaultHeight: 100
 * @prop width: device Width
 * @prop ...props
 *
 * @author Elton Jain
 * @version v1.0.2
 */

import React, { Component } from "react";
import { Platform, Dimensions, WebView } from "react-native";

const injectedIOSScript = function() {
  function waitForBridge() {
    if (window.postMessage.length !== 1) {
      setTimeout(waitForBridge, 200);
    } else {
      let height = 0;
      if (document.documentElement.clientHeight > document.body.clientHeight) {
        height = document.documentElement.clientHeight;
      } else {
        height = document.body.clientHeight;
      }
      postMessage(height);
    }
  }
  waitForBridge();
};

const injectedAndroidScript = function() {
  // Modification start
  const originalPostMessage = window.postMessage;
  const patchedPostMessage = function(message, targetOrigin, transfer) {
    originalPostMessage(message, targetOrigin, transfer);
  };
  patchedPostMessage.toString = function() {
    return String(Object.hasOwnProperty).replace(
      "hasOwnProperty",
      "postMessage"
    );
  };
  window.postMessage = patchedPostMessage;
  // Modification end
  function waitForBridge() {
    if (window.postMessage.length !== 1) {
      setTimeout(waitForBridge, 200);
    } else {
      let height = 0;
      if (document.documentElement.clientHeight > document.body.clientHeight) {
        height = document.documentElement.clientHeight;
      } else {
        height = document.body.clientHeight;
      }
      postMessage(height);
    }
  }
  waitForBridge();
};

export default class MyWebView extends Component {
  state = {
    webViewHeight: Number
  };

  static defaultProps = {
    autoHeight: true
  };

  constructor(props: Object) {
    super(props);
    this.state = {
      webViewHeight: this.props.defaultHeight
    };

    this._onMessage = this._onMessage.bind(this);
  }

  _onMessage(e) {
    this.setState({
      webViewHeight: parseInt(e.nativeEvent.data)
    });
  }

  stopLoading() {
    this.webview.stopLoading();
  }

  render() {
    const _w = this.props.width || Dimensions.get("window").width;
    const _h = this.props.autoHeight
      ? this.state.webViewHeight
      : this.props.defaultHeight;

    const { injectedJavaScript } = this.props;
    const script =
      Platform.OS === "ios" ? injectedIOSScript : injectedAndroidScript;
    return (
      <WebView
        ref={ref => {
          this.webview = ref;
        }}
        injectedJavaScript={`(${String(script)})();
        window.postMessage = String(Object.hasOwnProperty).replace('hasOwnProperty', 'postMessage');
        ${injectedJavaScript}`}
        scrollEnabled={this.props.scrollEnabled || false}
        onMessage={this._onMessage}
        javaScriptEnabled={true}
        automaticallyAdjustContentInsets={true}
        {...this.props}
        style={[{ width: _w }, this.props.style, { height: _h }]}
      />
    );
  }
}
