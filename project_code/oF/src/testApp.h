#pragma once

#include "ofMain.h"
#include "ofxOpenCv.h"
#include "ofxCv.h"
#include "ofxOpenNI.h"

//--------------------------------------------------------------
//#define	USE_MAC_CAM


//--------------------------------------------------------------
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

#define MAX_DEVICES 2


//--------------------------------------------------------------
class testApp : public ofBaseApp {
public:
	void setup();
	void update();
	void draw();
	void keyPressed( int key );
	void mouseDragged(int x, int y, int button);
    void mousePressed(int x, int y, int button);
    void mouseReleased(int x, int y, int button);
	
	void updateWaypoints(void);
	void updateSimRenderingSettings(void);
	void userEvent(ofxOpenNIUserEvent & event);
	
#ifdef USE_MAC_CAM
	ofVideoGrabber	grabber;
	ofImage			cam, edge, mask, tmp;
	
	ofRectangle			faceRect;
	ofxCv::ObjectFinder faceFinder;
	
	float	maskFrameScale;
	ofPoint	maskFrameOffset;
#else /* ifdef USE_MAC_CAM */
	int			numDevices;
	ofxOpenNI	kinect[MAX_DEVICES];
	ofImage		mask;
#endif /* ifdef USE_MAC_CAM */

	bool	isShot;
	ofxCv::ContourFinder contFinder;
	vector< vector<ofPoint> > waypoints;
	
#ifdef SIM_RENDERING
	int		simRenderStep;
	float	simRenderPointCnt;
	float	simRenderSpeed;
	float	simRenderScale;
	ofPoint	simRenderOffset;
#endif /* ifdef SIM_RENDERING */
};
