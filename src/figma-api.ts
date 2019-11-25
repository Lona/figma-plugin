import methods from "figma-jsonrpc";
import * as parseColor from "parse-color";
import { ConvertedWorkspace } from "./tokens";

const FONT_WEIGHTS = {
  ultralight: "ultralight",
  "100": "ultralight",
  thin: "thin",
  "200": "thin",
  light: "light",
  "300": "light",
  normal: "regular",
  regular: "regular",
  "400": "regular",
  semibold: "semibold",
  demibold: "semibold",
  "500": "semibold",
  "600": "semibold", // that's not right but /shrug
  bold: "bold",
  "700": "bold",
  extrabold: "heavy",
  ultrabold: "heavy",
  heavy: "heavy",
  "800": "heavy",
  black: "black",
  "900": "bacl"
};

export const figmaApi = methods({
  setToken(token: string) {
    return figma.clientStorage.setAsync("lona-token", token);
  },
  getToken() {
    return figma.clientStorage.getAsync("lona-token");
  },
  async importTokens(tokens: ConvertedWorkspace) {
    const fonts = await figma.listAvailableFontsAsync();

    tokens.files.forEach(file => {
      if (file.contents.type !== "flatTokens") {
        return;
      }
      file.contents.value.forEach(token => {
        const name = token.qualifiedName.join("/");

        if (token.value.type === "color") {
          const paintStyle = figma.createPaintStyle();
          paintStyle.name = name;
          const parsedColor = parseColor(token.value.value.css);
          paintStyle.paints = [
            {
              type: "SOLID",
              color: {
                r: parsedColor.rgb[0] / 255,
                g: parsedColor.rgb[1] / 255,
                b: parsedColor.rgb[2] / 255
              }
            }
          ];
        } else if (token.value.type === "textStyle") {
          const textStyle = figma.createTextStyle();
          textStyle.name = name;
          if (typeof token.value.value.color !== "undefined") {
            // no support for colors in figma's text styles
          }
          if (
            typeof token.value.value.fontFamily !== "undefined" ||
            typeof token.value.value.fontWeight !== "undefined"
          ) {
            // TODO: and what do we do with fontName?
            const lonaFontFamily = token.value.value.fontFamily || "Helvetica";
            const lonaFontWeight =
              typeof token.value.value.fontWeight !== "undefined"
                ? FONT_WEIGHTS[token.value.value.fontWeight] || "regular"
                : "regular";

            const potentialFonts = fonts.filter(
              x =>
                x.fontName.family.toLowerCase() === lonaFontFamily.toLowerCase()
            );

            if (!potentialFonts.length) {
              textStyle.fontName = {
                family: lonaFontFamily,
                style: lonaFontWeight
              };
            } else {
              const potentialStyle = potentialFonts.find(
                x =>
                  x.fontName.style.replace(/ /g, "").toLowerCase() ===
                  lonaFontWeight
              );
              textStyle.fontName = {
                family: potentialFonts[0].fontName.family,
                style: potentialStyle
                  ? potentialStyle.fontName.style
                  : lonaFontWeight
              };
            }
          }
          if (typeof token.value.value.fontSize !== "undefined") {
            textStyle.fontSize = token.value.value.fontSize;
          }
          if (typeof token.value.value.letterSpacing !== "undefined") {
            textStyle.letterSpacing = {
              value: token.value.value.letterSpacing,
              unit: "PIXELS"
            };
          }
          if (typeof token.value.value.lineHeight !== "undefined") {
            textStyle.lineHeight = {
              value: token.value.value.lineHeight,
              unit: "PIXELS"
            };
          }
        } else if (token.value.type === "shadow") {
          const shadow = figma.createEffectStyle();
          const parsedColor = parseColor(token.value.value.color.css);
          shadow.effects = [
            {
              type: "DROP_SHADOW",
              color: {
                r: parsedColor.rgb[0] / 255,
                g: parsedColor.rgb[1] / 255,
                b: parsedColor.rgb[2] / 255,
                a: 1
              },
              offset: {
                x: token.value.value.x,
                y: token.value.value.y
              },
              radius: token.value.value.radius,
              visible: true,
              blendMode: "NORMAL"
            }
          ];
        }
      });
    });
  }
});
