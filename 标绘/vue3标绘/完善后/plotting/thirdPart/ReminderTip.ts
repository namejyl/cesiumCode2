/*
 * 标绘提示弹窗tip
 * @Author: Wang jianLei
 * @Date: 2022-04-14 14:52:03
 * @Last Modified by: Wang JianLei
 * @Last Modified time: 2023-01-16 14:59:33
 */
const CreateRemindertip = (arr: any, position: any, show: boolean) => {
    let tooltip = document.getElementById("toolTip");
    let style: any, _x: number, _y: number;
    let _color: string = "";
    if (arr && typeof arr === "object") {
      style = arr;
    }
    if (style && style.origin) {
      style.origin === "center" && ((_x = 15), (_y = -12));
      style.origin === "top" && ((_x = 15), (_y = -44));
      style.origin === "bottom" && ((_x = 15), (_y = 20));
    } else {
      (_x = 15), (_y = 20);
    }
    if (style && style.color) {
      style.color === "white" &&
        (_color = "background: rgba(255, 255, 255, 0.8);color: black;");
      style.color === "black" &&
        (_color = "background: rgba(0, 0, 0, 0.8);color: white;");
      style.color === "yellow" &&
        (_color =
          "color: black;background-color: #ffcc33;border: 1px solid white;");
    } else {
      _color = "background: rgba(0, 0, 0, 0.8);color: white;";
    }
    if (tooltip === null) {
      const viewerDom = document.getElementsByClassName("cesium-viewer")[0];
      let elementbottom = document.createElement("div");
      viewerDom.append(elementbottom);
      let html =
        '<div id="toolTip" style="display: none;pointer-events: none;position: absolute;z-index: 1000;opacity: 0.8;border-radius: 4px;padding: 4px 8px;white-space: nowrap;font-family:黑体;color:white;font-weight: bolder;font-size: 14px;' +
        _color +
        '"></div>';
      viewerDom.insertAdjacentHTML("beforeend", html);
      tooltip = document.getElementById("toolTip");
    }
    if (show) {
      tooltip!.innerHTML = arr;
      tooltip!.style.left = position.x + _x! + "px";
      tooltip!.style.top = position.y + _y! + "px";
      tooltip!.style.display = "block";
    } else {
      tooltip!.style.display = "none";
    }
    return {
      tooltip: tooltip,
      style: style,
      showAt: function (position: any, text: any) {
        this.tooltip!.innerHTML = text;
        if (this.style && this.style.origin) {
          this.style.origin === "center" &&
            ((_x = 15), (_y = -this.tooltip!.offsetHeight / 2));
          this.style.origin === "top" &&
            ((_x = 15), (_y = -this.tooltip!.offsetHeight - 20));
          this.style.origin === "bottom" && ((_x = 15), (_y = 20));
        } else {
          (_x = 15), (_y = -this.tooltip!.offsetHeight / 2);
        }
        this.tooltip!.style.left = position.x + _x + "px";
        this.tooltip!.style.top = position.y + _y + "px";
        this.tooltip!.style.display = "block";
      },
      show: function (show: boolean) {
        if (show) {
          this.tooltip!.style.display = "block";
        } else {
          this.tooltip!.style.display = "none";
        }
      },
    };
  };
  export default CreateRemindertip;