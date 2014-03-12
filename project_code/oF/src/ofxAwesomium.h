//
//  ofxAwesomium.h
//  testAwesomium
//
//  Created by Ryota Katoh on 2014/03/11.
//
//

#ifndef __testAwesomium__ofxAwesomium__
#define __testAwesomium__ofxAwesomium__

#include <iostream>
#include "ofMain.h"

#include <Awesomium/WebCore.h>
#include <Awesomium/STLHelpers.h>
#include <Awesomium/BitmapSurface.h>


#define URL     "http://127.0.0.1:49903/testDrawDirection.html"

#define MAX_POINT   10


using namespace Awesomium;

class ofxAwesomium : public ofBaseApp{
    
public:
    void setup(int windowWidth, int windowHeight);
    void update();
    void draw(int x, int y);
    
    void keyPressed(int key);
	
    void setRgbaImageTOBgraImage(ofImage *,const unsigned char *,int w, int h);
    void setMarker(double lat, double lng);
    void drawDirection();
    void resetMarker();
    void resetMap();
    
    void setRandomMarker(int numMarker);
    
    WebCore *webCore;
    WebView *webView;
    int     webViewWidth, webViewHeigh;
    
    ofImage webImage;
    
    double  maxX, maxY, minX, minY;
    
};




#endif /* defined(__testAwesomium__ofxAwesomium__) */
