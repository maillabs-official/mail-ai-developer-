package com.maillabs.aideveloper;
import android.app.Activity;
import android.os.Bundle;
import android.webkit.*;
import java.io.IOException;
public class MainActivity extends Activity {
  private static final String ORIGIN = "https://appassets.androidplatform.net";
  @Override public void onCreate(Bundle state) {
    super.onCreate(state);
    WebView web = new WebView(this);
    WebSettings settings = web.getSettings();
    settings.setJavaScriptEnabled(true);
    settings.setDomStorageEnabled(true);
    settings.setAllowFileAccess(false);
    settings.setAllowContentAccess(false);
    settings.setMixedContentMode(WebSettings.MIXED_CONTENT_NEVER_ALLOW);
    web.setWebViewClient(new WebViewClient() {
      @Override public WebResourceResponse shouldInterceptRequest(WebView view, WebResourceRequest request) {
        if (request.getUrl().toString().equals(ORIGIN + "/index.html")) {
          try { return new WebResourceResponse("text/html", "UTF-8", getAssets().open("index.html")); }
          catch (IOException ignored) { return null; }
        }
        return super.shouldInterceptRequest(view, request);
      }
      @Override public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
        return !request.getUrl().toString().equals(ORIGIN + "/index.html");
      }
    });
    setContentView(web);
    web.loadUrl(ORIGIN + "/index.html");
  }
}