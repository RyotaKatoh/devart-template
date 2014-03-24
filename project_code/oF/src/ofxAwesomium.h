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


#define URL     "http://127.0.0.1:49514/testDrawDirection.html"

#define MAX_POINT   10


using namespace Awesomium;

class ofxAwesomium : public ofBaseApp{
    
public:
    void setup(int windowWidth, int windowHeight);
    void update();
    void draw(int x, int y);
    
    void keyPressed(int key);
    void mouseDragged(int x, int y, int button);
    void mousePressed(int x, int y, int button);
    void mouseReleased(int x, int y, int button);
	
    void setRgbaImageTOBgraImage(ofImage *,const unsigned char *,int w, int h);
    void setMarker(double lat, double lng);
    void drawDirection();
    void resetMarker();
    void resetMap();
    void setMarkerOfWaypoint(double lat, double lng,int flag);
    void drawFaceWithDirection();
    
    /* set JS Variables */
    void setLatLngBounds();
    void setNumLine();
    void setDebugVal();
    void setTotalDistance();
    
    void setRandomMarker(int numMarker);
    
    WebCore *webCore;
    WebView *webView;
    int     webViewWidth, webViewHeigh;
    
    ofImage webImage;
    
    bool    isReadBoundsInfo;
    double  maxLat, maxLng, minLat, minLng;
    int     numLine;
    
    int     debugVal;
    
    double  totalDistance;
};




#endif /* defined(__testAwesomium__ofxAwesomium__) */
