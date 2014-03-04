#include "testApp.h"

using namespace ofxCv;
using namespace cv;

void testApp::setup() {
	grabber.initGrabber(CAM_WIDTH, CAM_HEIGHT);
	faceFinder.setup("haarcascade_frontalface_alt2.xml");
	faceFinder.setPreset(ObjectFinder::Fast);
	
	isShot = false;

#ifdef SIM_RENDERING
	simRenderStep = 1;
	simRenderPointCnt = 0.0;
	simRenderSpeed = SIM_SPEED_STEP * 4;
	simRenderScale = max(MAP_FRAME_SIZE_WIDTH / EDGE_FRAME_SIZE_WIDTH, MAP_FRAME_SIZE_HEIGHT / EDGE_FRAME_SIZE_HEIGHT);
	simRenderOffset.x = CAM_FRAME_SIZE_WIDTH;
	simRenderOffset.y = 0;
#endif
}

void testApp::update() {
	
	grabber.update();
	if (grabber.isFrameNew()) {
		cam.clear();
		cam.setFromPixels(grabber.getPixels(), CAM_WIDTH, CAM_HEIGHT);
		cam.mirror(false, true);
		
		// face recagnition
		faceFinder.update(cam);
		if (faceFinder.size() != 0) {
			faceRect = faceFinder.getObject(0);
		} else {
			faceRect = ofRectangle();
		}
		
		if (isShot) {
			isShot = false;
			
			// coherrent line ditection
			gray.clear();
			tmp.clear();
			edge.clear();
			convertColor(cam, gray, CV_RGB2GRAY);
			CLD(gray, tmp, 4, 2, 1, 3, 0.97, 0);
			edge.cropFrom(tmp, faceRect.x, faceRect.y, faceRect.width, faceRect.height);
			
			// binarizing
			autothreshold(edge, true);
			thin(edge);
			
			// contour finding
			contFinder.setAutoThreshold(true);
			contFinder.findContours(edge);
			
			// way points setting
			for (int i = 0; i < wayPoints.size(); i++) {
				wayPoints[i].clear();
			}
			wayPoints.clear();
			
			for (int i = 0; i < contFinder.getContours().size(); i++) {
				vector <ofPoint> tmpPoint;
				for (int j = 0; j < contFinder.getContour(i).size(); j++) {
					ofPoint point;
					point.x = (float)contFinder.getContours()[i][j].x / edge.width;		// normalized
					point.y = (float)contFinder.getContours()[i][j].y / edge.height;
					tmpPoint.push_back(point);
				}
				wayPoints.push_back(tmpPoint);
			}
			
			// image fitting
			if ( EDGE_FRAME_SIZE_WIDTH > EDGE_FRAME_SIZE_HEIGHT ) {
				edgeFrameScale = (float)EDGE_FRAME_SIZE_HEIGHT / edge.height;
				edgeFrameOffset.x = (EDGE_FRAME_SIZE_WIDTH - edge.width * edgeFrameScale) / 2;
				edgeFrameOffset.y = CAM_FRAME_SIZE_HEIGHT;
			} else {
				edgeFrameScale = (float)EDGE_FRAME_SIZE_WIDTH / edge.width;
				edgeFrameOffset.x = CAM_FRAME_SIZE_WIDTH;
				edgeFrameOffset.y = (EDGE_FRAME_SIZE_HEIGHT - edge.height * edgeFrameScale) / 2;
			}
			edge.resize(edge.width * edgeFrameScale, edge.height * edgeFrameScale);
			
#ifdef SIM_RENDERING
			if ( MAP_FRAME_SIZE_WIDTH > MAP_FRAME_SIZE_HEIGHT ) {
				simRenderScale = (float)MAP_FRAME_SIZE_HEIGHT;
				simRenderOffset.x = CAM_FRAME_SIZE_WIDTH + (MAP_FRAME_SIZE_WIDTH - simRenderScale) / 2;
				simRenderOffset.y = 0;
			} else {
				simRenderScale = (float)MAP_FRAME_SIZE_WIDTH;
				simRenderOffset.x = 0;
				simRenderOffset.y = CAM_FRAME_SIZE_HEIGHT + (MAP_FRAME_SIZE_HEIGHT - simRenderScale) / 2;
			}
			simRenderPointCnt = 0.0;
#endif
		}
		cam.resize(CAM_FRAME_SIZE_WIDTH, CAM_FRAME_SIZE_HEIGHT);
		
		faceRect.x *= ((float)CAM_FRAME_SIZE_WIDTH / CAM_WIDTH);
		faceRect.y *= ((float)CAM_FRAME_SIZE_HEIGHT / CAM_HEIGHT);
		faceRect.width *= ((float)CAM_FRAME_SIZE_WIDTH / CAM_WIDTH);
		faceRect.height *= ((float)CAM_FRAME_SIZE_HEIGHT / CAM_HEIGHT);
	}
	
#ifdef SIM_RENDERING
	simRenderPointCnt += simRenderSpeed;
	if (simRenderPointCnt >= FLT_MAX) {
		simRenderPointCnt = 0.0;
	}
#endif
}

void testApp::draw() {
	ofBackground(0);
	
	// camera image rendering
	ofSetColor(255);
	cam.draw(0, 0);
	
	// face reagion rendering
	ofSetColor(255, 0, 0);
	ofSetLineWidth(1);
	ofNoFill();
	ofRect(faceRect);
	
	// face edge rendering
	ofSetColor(255);
	edge.draw(edgeFrameOffset.x, edgeFrameOffset.y);
	
	// frame line rendering
	ofSetColor(255);
	ofSetLineWidth(FRAME_LINE_WIDTH);
	ofRect(0, 0, CAM_FRAME_SIZE_WIDTH, CAM_FRAME_SIZE_HEIGHT);
	ofRect(0, CAM_FRAME_SIZE_HEIGHT, EDGE_FRAME_SIZE_WIDTH, EDGE_FRAME_SIZE_HEIGHT);
	ofRect(CAM_FRAME_SIZE_WIDTH, 0, MAP_FRAME_SIZE_WIDTH, MAP_FRAME_SIZE_HEIGHT);

#ifdef SIM_RENDERING
	// string rendering
	ofSetColor(255);
	ofFill();
	string info = "Frame Rate: " + ofToString(ofGetFrameRate(), 2) + "\n";
	info += "Rendering Speed: " + ofToString(simRenderSpeed, 2) + "\n";
	info += "Resolution: " + ofToString(simRenderStep);
	ofDrawBitmapStringHighlight(info, 0, ofGetHeight() - 30);
#endif
	
#ifdef SIM_RENDERING
	// face contour rendering
	ofSetColor(0, 255, 0);
	ofFill();
	ofPoint pointPrev;
	ofPoint point;
	int cnt = 0;
	for (int i = 0; i < wayPoints.size(); i++) {
		pointPrev = wayPoints[i][0];
		pointPrev *= simRenderScale;
		pointPrev += simRenderOffset;
		for (int j = 0; j < wayPoints[i].size(); j = j + simRenderStep) {
			cnt++;
			point = wayPoints[i][j];
			point *= simRenderScale;
			point += simRenderOffset;
			if ( cnt > simRenderPointCnt) {
				ofCircle(point.x, point.y, 10);
				return;
			}
			ofLine(pointPrev.x, pointPrev.y, point.x, point.y);
			pointPrev = point;
		}
	}
	simRenderPointCnt = 0.0;
#endif
}

void testApp::keyPressed( int key ) {
	if ( (key == ' ') && (faceFinder.size() != 0)) {
		isShot = true;
	}
#ifdef SIM_RENDERING
	if(key == OF_KEY_UP) simRenderSpeed += SIM_SPEED_STEP;
	if(key == OF_KEY_DOWN) simRenderSpeed -= SIM_SPEED_STEP;
	if(key == OF_KEY_LEFT) simRenderStep += 1;
	if(key == OF_KEY_RIGHT) simRenderStep -= 1;
	
	if (simRenderSpeed < SIM_SPEED_STEP) {
		simRenderSpeed = SIM_SPEED_STEP;
	}
	if (simRenderStep < 1) {
		simRenderStep = 1;
	}
#endif
}

void testApp::mouseDragged(int x, int y, int button) {

}

void testApp::mousePressed(int x, int y, int button) {

}

void testApp::mouseReleased(int x, int y, int button) {

}
