import methods from "figma-jsonrpc";
import * as parseColor from "parse-color";

export const figmaApi = methods({
  setToken(token: string) {
    return figma.clientStorage.setAsync("lona-token", token);
  },
  getToken() {
    return figma.clientStorage.getAsync("lona-token");
  },
  importTokens({
    tokens
  }: {
    tokens: { type: string; value: string; name?: string }[];
  }) {
    tokens.forEach(token => {
      if (token.type === "color") {
        const paintStyle = figma.createPaintStyle();
        paintStyle.name = token.name || token.value;
        const parsedColor = parseColor(token.value);
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
      }
    });
  }
});
