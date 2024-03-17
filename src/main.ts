// @ts-ignore isolatedModules
import { wait } from "@xiaotianxt/monkey-tool";
import "./main.css";
import { Log } from "./treehole";

const log = new Log();

(async () => {
  /**
   * 丝滑滚动
   */
  function registerInfiniteScrollInjection() {
    const observer = new MutationObserver((mutations, _) => {
      // Make sure this is new added right container (drawer) of app.
      const drawer = mutations.find(
        (item) =>
          item.addedNodes?.[0] &&
          item.addedNodes[0].isSameNode(app.childNodes[2])
      )?.addedNodes?.[0] as HTMLDivElement | undefined;
      if (!drawer) return;

      const infiniteScrollContainer =
        drawer.querySelector<HTMLDivElement>(".sidebar-content");
      if (!infiniteScrollContainer) return;

      infiniteScrollContainer.setAttribute("infinite-scroll-distance", "1000");
    });

    observer.observe(app, {
      childList: true,
    });

    const originalGetById = document.getElementById;

    document.getElementById = (elementId: string) => {
      if (elementId == "table_list") {
        const tableList = originalGetById.apply(document, [
          elementId,
        ]) as HTMLDivElement;

        return new Proxy(tableList, {
          get(obj, p) {
            if (p === "offsetHeight") return obj.offsetHeight - 950;
            return (obj as any)[p];
          },
        });
      }
      return originalGetById.apply(document, [elementId]);
    };
  }

  /**
   * 复制文案
   */
  function registerCopyThread() {
    const copyLabel = document.createElement("div");
    copyLabel.id = "copy-indicator";
    copyLabel.innerText = "复制树洞";

    const observer = new MutationObserver(async (mutations, _) => {
      // Make sure this is new added right container (drawer) of app.
      const drawer = mutations.find(
        (item) =>
          item.addedNodes?.[0] &&
          item.addedNodes[0].isSameNode(app.childNodes[2])
      )?.addedNodes?.[0] as HTMLDivElement | undefined;
      if (!drawer) return;

      const element = await wait(".box-id", drawer);

      element.appendChild(copyLabel);
      element.addEventListener("click", () => {});
    });

    observer.observe(app, {
      childList: true,
    });
  }

  /**
   * 撤销删帖
   */
  function undoDelete() {
    // 保存原始的XMLHttpRequest.send方法
    const originalSend = XMLHttpRequest.prototype.send;

    // 在 XMLHttpRequest 对象上临时存储响应数据，以便在 getter 中使用
    Object.defineProperty(XMLHttpRequest.prototype, "_response", {
      writable: true,
    });

    // 重写XMLHttpRequest的send方法
    XMLHttpRequest.prototype.send = function (
      body?: Document | BodyInit | null
    ): void {
      this.onreadystatechange = () => {
        const path = new URL(this.responseURL, window.location.href).pathname;
        if (!/\/api\/pku_hole/.test(path)) return;

        if (this.readyState === 4 && this.status === 200) {
          // 通过Object.defineProperty修改responseText的getter
          Object.defineProperty(this, "responseText", {
            get: function () {
              let modifiedData;
              try {
                const originalData = JSON.parse(this._response);

                // 在这里篡改原始数据
                modifiedData = log.replace(originalData); // 假设你修改了originalData
              } catch (e) {
                console.error("解析JSON数据出错:", e);
                modifiedData = this._response; // 出错时返回原始数据
              }
              return JSON.stringify(modifiedData); // 返回修改后的数据
            },
          });
        }
      };

      // 保存原始响应文本到 _response 以供 getter 使用
      const originalOnload = this.onload;
      this.onload = (e) => {
        if (this.response) {
          // @ts-ignore
          this._response = this.response;
        }
        if (originalOnload) {
          originalOnload.call(this, e);
        }
      };

      // @ts-ignore 调用原始的send方法
      originalSend.call(this, body);
    };
  }

  undoDelete();

  const app = (await wait("#eagleMapContainer")) as HTMLDivElement;
  (await wait(".icon-refresh")).click();
  registerCopyThread();
  registerInfiniteScrollInjection();
})();
