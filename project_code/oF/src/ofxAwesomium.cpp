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
    
    isReadBoundsInfo = false;
    
    totalDistance    = 0.0;
    
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
    /* set JS variables. */
    if(!webView->IsLoading() && !isReadBoundsInfo){
       
        setLatLngBounds();
        setNumLine();
        
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
        
        //args.Push(arg2);
        args.Push(arg1);
        args.Push(arg2);
        
        window.ToObject().Invoke(WSLit("setMarker"), args);
        
    }
    
}

void ofxAwesomium::setMarkerOfWaypoint(double lat, double lng, int flag){
    
    // flag == 100 separate waypoint
    
    JSValue window = webView->ExecuteJavascriptWithResult(WSLit("window"), WSLit(""));
    
    if (window.IsObject()) {
        
        JSArray args;
        JSValue arg1 = JSValue(lat);
        JSValue arg2 = JSValue(lng);
        JSValue arg3 = JSValue(flag);
       
      
        args.Push(arg1);
        args.Push(arg2);
        args.Push(arg3);
        
        window.ToObject().Invoke(WSLit("setWaypoints"), args);
        
    }
    
}

void ofxAwesomium::drawFaceWithDirection(){
    WebString func = WSLit("drawFaceWithDirection();");
    WebString xpath = WSLit("");
    
    webView->ExecuteJavascript(func, xpath);
    
}

void ofxAwesomium::drawDirection(){

    WebString func = WSLit("drawDirection();");
    WebString xpath = WSLit("");
    
    JSValue statusMessage = webView->ExecuteJavascriptWithResult(func, xpath);
    
    WebString returnMessage = statusMessage.ToString();
    
    char message[128];
    returnMessage.ToUTF8(message, 128);

    
    
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

void ofxAwesomium::resetWaypoints(){
    WebString func = WSLit("resetWaypoints();");
    WebString xpath = WSLit("");
    
    webView->ExecuteJavascript(func, xpath);
    
    
}

void ofxAwesomium::setRandomMarker(int numMarker){

    for(int i=0;i<numMarker;i++){
        double randX, randY;
        randX = ofRandom((float)minLat, (float)maxLat);
        randY = ofRandom((float)minLng, (float)maxLng);
        
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

//--------------------------------------------------------------

void ofxAwesomium::mouseDragged(int x, int y, int button){

    webView->InjectMouseMove(x, y);
}

void ofxAwesomium::mousePressed(int x, int y, int button){

    webView->InjectMouseMove(x, y);
    webView->InjectMouseDown(kMouseButton_Left);
    
    
}

void ofxAwesomium::mouseReleased(int x, int y, int button){

    webView->InjectMouseUp(kMouseButton_Left);
    
#pragma mark TODO wayPointsとmaxLatLngとかの初期化
    
    setLatLngBounds();
    resetWaypoints();
    
    
    
}

void ofxAwesomium::mapZoomUp(){

    webView->InjectMouseMove(webViewWidth/2, webViewHeigh/2);
    webView->InjectMouseWheel(1, 0);

}

void ofxAwesomium::mapZoomDown(){

    webView->InjectMouseMove(webViewWidth/2, webViewHeigh/2);
    webView->InjectMouseWheel(-1, 0);
    
}

//--------------------------------------------------------------

void ofxAwesomium::setLatLngBounds(){
   
    WebString func = WSLit("getLatLngBound();");
    WebString xpath = WSLit("");
    JSValue myValue = webView->ExecuteJavascriptWithResult(func, xpath);
    
    if(myValue.IsObject()) {
        JSObject& latLng = myValue.ToObject();
        
        maxLat = latLng.GetProperty(WSLit("maxLat")).ToDouble();
        maxLng = latLng.GetProperty(WSLit("maxLng")).ToDouble();
        minLat = latLng.GetProperty(WSLit("minLat")).ToDouble();
        minLng = latLng.GetProperty(WSLit("minLng")).ToDouble();
        
        isReadBoundsInfo = true;
        
        printf("maxLat, minLat:%lf, %lf\n",maxLat, minLat);
        printf("maxLng, minLng:%lf, %lf\n",maxLng, minLng);
    }
    
}

void ofxAwesomium::setNumLine(){

    WebString func = WSLit("getNumLine();");
    WebString xpath = WSLit("");
    JSValue myValue = webView->ExecuteJavascriptWithResult(func, xpath);
    
    
    numLine = myValue.ToInteger();
        
//    printf("numLine: %d\n",numLine);
    
}

void ofxAwesomium::setDrawingLineNumber(){
    
    WebString func = WSLit("getDrawingLineNumber();");
    WebString xpath = WSLit("");
    JSValue myValue = webView->ExecuteJavascriptWithResult(func, xpath);
    
    
    drawingLineNumber = myValue.ToInteger();
    
}


/* return meter distance. */
void ofxAwesomium::setTotalDistance(){
    
    WebString func = WSLit("getTotalDistance();");
    WebString xpath = WSLit("");
    JSValue myValue = webView->ExecuteJavascriptWithResult(func, xpath);
    
    totalDistance = myValue.ToDouble();
    
    
}

void ofxAwesomium::setDebugVal(){
    
    WebString func = WSLit("getDebugVal();");
    WebString xpath = WSLit("");
    JSValue myValue = webView->ExecuteJavascriptWithResult(func, xpath);
    
    
    debugVal = myValue.ToInteger();
    
//    printf("debugVal: %d\n", debugVal);
    
    
}
