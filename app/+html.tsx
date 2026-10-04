import { ScrollViewStyleReset } from "expo-router/html";
import type { PropsWithChildren } from "react";

/** The HTML page wrapping the app on web (not used on iOS/Android). */
export default function Root({ children }: PropsWithChildren) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />
        <ScrollViewStyleReset />
        {/*
          - Password fields have their own show/hide button, so hide Edge's built-in one
          - Form fields show focus with an orange border, so drop the default outline
        */}
        <style
          dangerouslySetInnerHTML={{
            __html: `
              input::-ms-reveal, input::-ms-clear { display: none; }
              input:focus, textarea:focus { outline: none; }
            `,
          }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
