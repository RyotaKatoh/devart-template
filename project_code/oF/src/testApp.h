#pragma once

#include "ofMain.h"
#include "ofxOpenCv.h"
#include "ofxCv.h"

#include "ofxAwesomium.h"


#define CAM_WIDTH			640
#define CAM_HEIGHT			480

#define CAM_FRAME_SIZE_WIDTH		320
#define CAM_FRAME_SIZE_HEIGHT		240
#define EDGE_FRAME_SIZE_WIDTH		320
#define EDGE_FRAME_SIZE_HEIGHT		240
#define MAP_FRAME_SIZE_WIDTH		640
#define MAP_FRAME_SIZE_HEIGHT		480
#define FRAME_LINE_WIDTH			5

#define WAYPOINTS_LIMIT		10

#define SIM_SPEED_STEP		0.25

class testApp : public ofBaseApp {
public:
	void setup();
	void update();
	void draw();
	void keyPressed( int key );
	void mouseDragged(int x, int y, int button);
    void mousePressed(int x, int y, int button);
    void mouseReleased(int x, int y, int button);
	
	ofVideoGrabber	grabber;
	ofxCvColorImage	cam;
	ofImage			gray, edge, tmp;
	
	ofRectangle			faceRect;
	ofxCv::ObjectFinder faceFinder;
	ofxCv::ContourFinder contFinder;
		
	bool	isShot;
	float	edgeFrameScale;
	ofPoint	edgeFrameOffset;
#ifdef SIM_RENDERING
	int		simRenderStep;
	float	simRenderPointCnt;
	float	simRenderSpeed;
	float	simRenderScale;
	ofPoint	simRenderOffset;
#endif
	vector< vector<ofPoint> > waypoints;
    
    ofxAwesomium    myAwesomium;
    ofPoint         awesomiumOffset;
    float           awesomiumScale;
    
    /* debug variables */
    int frameRate;
    bool drawFlag;
    
};
