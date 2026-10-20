export interface ColorSwatch {
  label: string;
  cssVar: `--${string}`;
  className: string;
}

export interface TypeSample {
  token: string;
  className: string;
  sample: string;
}
