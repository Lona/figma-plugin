export type FontWeight =
  | "100"
  | "200"
  | "300"
  | "400"
  | "500"
  | "600"
  | "700"
  | "800"
  | "900";

export interface ColorValue {
  css: string;
}

export interface TextStyleValue {
  fontName?: string;
  fontFamily?: string;
  fontWeight: FontWeight;
  fontSize?: number;
  lineHeight?: number;
  letterSpacing?: number;
  color?: ColorValue;
}

export interface ShadowValue {
  x: number;
  y: number;
  blur: number;
  radius: number;
  color: ColorValue;
}

export type TokenValue =
  | {
      type: "color";
      value: ColorValue;
    }
  | {
      type: "shadow";
      value: ShadowValue;
    }
  | {
      type: "textStyle";
      value: TextStyleValue;
    };

export interface Token {
  qualifiedName: Array<string>;
  value: TokenValue;
}

export type ConvertedFileContents =
  | {
      type: "flatTokens";
      value: Array<Token>;
    }
  | {
      type: "mdxString";
      value: string;
    };

export interface ConvertedFile {
  inputPath: string;
  outputPath: string;
  name: string;
  contents: ConvertedFileContents;
}

export interface ConvertedWorkspace {
  files: Array<ConvertedFile>;
  flatTokensSchemaVersion: string;
}
