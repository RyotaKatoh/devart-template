//
//  ofxAwesomium.cpp
//  testAwesomium
//
//  Created by Ryota Katoh on 2014/03/11.
//
//

#include "ofxAwesomium.h"


//--------------------------------------------------------------
void ofxAwesomium::setup(int windowWidth, int windowHeight){
    
    /* awesomium setup */
    webViewWidth = windowWidth;
    webViewHeigh = windowHeight;
    
    webCore = WebCore::Initialize(WebConfig());
    
    webView = webCore->CreateWebView(webViewWidth, webViewHeigh);
    
    
    WebURL url(WSLit(URL));
    webView->LoadURL(url);
    
    
    webView->Focus();
    
    
    /* webImage is to draw webView image. */
    webImage.allocate(webViewWidth, webViewHeigh, OF_IMAGE_COLOR_ALPHA);
    
}


//--------------------------------------------------------------
void ofxAwesomium::update(){
    
    webCore->Update();
    
    
    BitmapSurface *surface = (BitmapSurface *)webView->surface();
    
    if(surface != 0){
        
        setRgbaImageTOBgraImage(&webImage, surface->buffer(), webViewWidth, webViewHeigh);
        
    }
    
    /* set max min LatLng information. */
    if(!webView->IsLoading()){
        WebString func = WSLit("getLatLngBound();");
        WebString xpath = WSLit("");
        JSValue myValue = webView->ExecuteJavascriptWithResult(func, xpath);
        
        if(myValue.IsObject()) {
            JSObject& latLng = myValue.ToObject();
            
            maxX = latLng.GetProperty(WSLit("maxX")).ToDouble();
            maxY = latLng.GetProperty(WSLit("maxY")).ToDouble();
            minX = latLng.GetProperty(WSLit("minX")).ToDouble();
            minY = latLng.GetProperty(WSLit("minY")).ToDouble();
            
        }
        
    }
    
}

//--------------------------------------------------------------
void ofxAwesomium::draw(int x, int y){
    
    /* draw awsomium webView*/
    ofSetColor(255);
    webImage.draw(x, y);
	
    if(webView->IsLoading()){
        
        ofSetColor(0);
        ofDrawBitmapString("Loading...", 10, ofGetHeight()-20);
        
    }
    
}

//--------------------------------------------------------------
void ofxAwesomium::setRgbaImageTOBgraImage( ofImage *input,const unsigned char *pixcels,int w, int h){
    
    unsigned char *outputPixcels = new unsigned char [w*h*4];
    
    unsigned char r,g,b,a;
    
    for(int y=0;y<h;y++){
        for(int x=0;x<w;x++){
            b = pixcels[(w*y + x)*4 ];
            g = pixcels[(w*y + x)*4 +1];
            r = pixcels[(w*y + x)*4 +2];
            a = pixcels[(w*y + x)*4 +3];
            
            outputPixcels[(w*y + x)*4 ]   = r;
            outputPixcels[(w*y + x)*4 +1] = g;
            outputPixcels[(w*y + x)*4 +2] = b;
            outputPixcels[(w*y + x)*4 +3] = a;
            
        }
    }
    
    input->setFromPixels(outputPixcels, w, h, OF_IMAGE_COLOR_ALPHA);
    
    delete outputPixcels;
    
}

//--------------------------------------------------------------

void ofxAwesomium::setMarker(double lat, double lng){
    
    
    
    JSValue window = webView->ExecuteJavascriptWithResult(WSLit("window"), WSLit(""));
    
    if (window.IsObject()) {
        
        JSArray args;
        JSValue arg1 = JSValue(lat);
        JSValue arg2 = JSValue(lng);
        
        args.Push(arg2);
        args.Push(arg1);
        
        window.ToObject().Invoke(WSLit("setMarker"), args);
        
    }
    
}

void ofxAwesomium::drawDirection(){

    WebString func = WSLit("drawDirection();");
    WebString xpath = WSLit("");
    
    JSValue statusMessage = webView->ExecuteJavascriptWithResult(func, xpath);
    
    WebString returnMessage = statusMessage.ToString();
    
    char message[128];
    returnMessage.ToUTF8(message, 128);
    
    cout<<message<<endl;
    
    
}

void ofxAwesomium::resetMarker(){
    
    WebString func = WSLit("resetMarker();");
    WebString xpath = WSLit("");
    
    webView->ExecuteJavascript(func, xpath);
    
}

void ofxAwesomium::resetMap(){
   
    WebString func = WSLit("resetMap();");
    WebString xpath = WSLit("");
    
    webView->ExecuteJavascript(func, xpath);
    
}

void ofxAwesomium::setRandomMarker(int numMarker){

    for(int i=0;i<numMarker;i++){
        double randX, randY;
        randX = ofRandom((float)minX, (float)maxX);
        randY = ofRandom((float)minY, (float)maxY);
        
        printf("setRandomMarket:(lat, lng): (%lf, %lf)\n",randX, randY);
        
        setMarker(randX, randY);
            
    }
    
}

//--------------------------------------------------------------
void ofxAwesomium::keyPressed(int key){
    
    
    if(key == 'd'){

        drawDirection();
        
    }
    
    
    if(key == 'r'){
        
        resetMarker();
        
    }
    
    if(key == 'l'){
        
        resetMap();
        
    }
    
    if(key == 't'){
        
        setRandomMarker(10);
    }
    
}


