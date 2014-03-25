#include "testApp.h"



//--------------------------------------------------------------
using namespace ofxCv;
using namespace cv;


//--------------------------------------------------------------
void testApp::setup() {

	
#ifdef USE_MAC_CAM

	grabber.initGrabber(CAM_WIDTH, CAM_HEIGHT);
	faceFinder.setup("haarcascade_frontalface_alt2.xml");
	faceFinder.setPreset(ObjectFinder::Fast);

#else /* ifdef USE_MAC_CAM */
	numDevices = kinect[0].getNumDevices();
    
    for (int deviceID = 0; deviceID < numDevices; deviceID++){
        //kinect[deviceID].setLogLevel(OF_LOG_VERBOSE); // ofxOpenNI defaults to ofLogLevel, but you can force to any level
        kinect[deviceID].setup();
        kinect[deviceID].addDepthGenerator();
        kinect[deviceID].addImageGenerator();
        kinect[deviceID].addUserGenerator();
        kinect[deviceID].setRegister(true);
        kinect[deviceID].setMirror(true);
		kinect[deviceID].start();
    }
    
    kinect[0].setMaxNumUsers(1); // defualt is 4
    ofAddListener(kinect[0].userEvent, this, &testApp::userEvent);
    
    ofxOpenNIUser user;
    user.setUseMaskTexture(true);
    user.setUsePointCloud(true);
    user.setPointCloudDrawSize(2);
    user.setPointCloudResolution(2);
    kinect[0].setBaseUserClass(user);
#endif /* ifdef USE_MAC_CAM */
	
	isShot = false;
	contFinder.setFindHoles(false);

#ifdef SIM_RENDERING
	simRenderStep = 1;
	simRenderPointCnt = 0.0;
	simRenderSpeed = SIM_SPEED_STEP * 4;
	simRenderScale = max(MAP_FRAME_SIZE_WIDTH / EDGE_FRAME_SIZE_WIDTH, MAP_FRAME_SIZE_HEIGHT / EDGE_FRAME_SIZE_HEIGHT);
	simRenderOffset.x = CAM_FRAME_SIZE_WIDTH;
	simRenderOffset.y = 0;
#endif /* ifdef SIM_RENDERING */

    myAwesomium.setup(MAP_FRAME_SIZE_WIDTH, MAP_FRAME_SIZE_HEIGHT);
    awesomiumOffset.x = CAM_FRAME_SIZE_WIDTH;
    awesomiumOffset.y = 0;

    frameRate = 0;
    drawFlag  = false;
    
    
    /* debug area please comment out */
//    fp = fopen("setwaypoints.txt","wt");
    
    

}


//--------------------------------------------------------------
void testApp::update() {
	

#ifdef USE_MAC_CAM
	grabber.update();
    
	if (grabber.isFrameNew()) {
		cam.setFromPixels(grabber.getPixels(), CAM_WIDTH, CAM_HEIGHT, OF_IMAGE_COLOR);
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
			convertColor(cam, tmp, CV_RGB2GRAY);
			CLD(tmp, edge, 4, 2, 1, 3, 0.97, 0);
			mask.cropFrom(edge, faceRect.x, faceRect.y, faceRect.width, faceRect.height);
			
			// binarizing
			autothreshold(mask, true);
			thin(mask);
			
			// contour finding
			contFinder.setAutoThreshold(true);
			contFinder.findContours(mask);
			
			updateWaypoints();
			
			// image fitting
			if ( EDGE_FRAME_SIZE_WIDTH > EDGE_FRAME_SIZE_HEIGHT ) {
				maskFrameScale = (float)EDGE_FRAME_SIZE_HEIGHT / mask.height;
				maskFrameOffset.x = (EDGE_FRAME_SIZE_WIDTH - mask.width * maskFrameScale) / 2;
				maskFrameOffset.y = CAM_FRAME_SIZE_HEIGHT;
			} else {
				maskFrameScale = (float)EDGE_FRAME_SIZE_WIDTH / mask.width;
				maskFrameOffset.x = CAM_FRAME_SIZE_WIDTH;
				maskFrameOffset.y = (EDGE_FRAME_SIZE_HEIGHT - mask.height * maskFrameScale) / 2;
			}
			mask.resize(mask.width * maskFrameScale, mask.height * maskFrameScale);
			
//<<<<<<< HEAD
//#ifdef SIM_RENDERING
//			if ( MAP_FRAME_SIZE_WIDTH > MAP_FRAME_SIZE_HEIGHT ) {
//				simRenderScale = (float)MAP_FRAME_SIZE_HEIGHT;
//				simRenderOffset.x = CAM_FRAME_SIZE_WIDTH + (MAP_FRAME_SIZE_WIDTH - simRenderScale) / 2;
//				simRenderOffset.y = 0;
//			} else {
//				simRenderScale = (float)MAP_FRAME_SIZE_WIDTH;
//				simRenderOffset.x = 0;
//				simRenderOffset.y = CAM_FRAME_SIZE_HEIGHT + (MAP_FRAME_SIZE_HEIGHT - simRenderScale) / 2;
//			}
//			simRenderPointCnt = 0.0;
//#endif
//
//            
//        }
//=======
			updateSimRenderingSettings();
		}
//		// resizing
//>>>>>>> 2241090b5b218f8dd5e831475f55b9da4f3187ed
		cam.resize(CAM_FRAME_SIZE_WIDTH, CAM_FRAME_SIZE_HEIGHT);
			
		faceRect.x *= ((float)CAM_FRAME_SIZE_WIDTH / CAM_WIDTH);
		faceRect.y *= ((float)CAM_FRAME_SIZE_HEIGHT / CAM_HEIGHT);
		faceRect.width *= ((float)CAM_FRAME_SIZE_WIDTH / CAM_WIDTH);
		faceRect.height *= ((float)CAM_FRAME_SIZE_HEIGHT / CAM_HEIGHT);
	}
			
#else /* ifdef USE_MAC_CAM */
	// update kinect
	for (int deviceID = 0; deviceID < numDevices; deviceID++){
		kinect[deviceID].update();
	}
	
	// user recognition
	int numUsers = kinect[0].getNumTrackedUsers();
	for (int nID = 0; nID < numUsers; nID++){
		ofxOpenNIUser & user = kinect[0].getTrackedUser(nID);
		if (user.isTracking()) {
			if (!mask.isAllocated()) {
				mask.allocate(user.getMaskPixels().getWidth(), user.getMaskPixels().getHeight(), OF_IMAGE_GRAYSCALE);
			}
			mask.setFromPixels(user.getMaskPixels().getChannel(3));
			invert(mask);
		}
	}
	
	// contours finding
	contFinder.setAutoThreshold(true);
	if (mask.isAllocated()) {
		contFinder.findContours(mask);
	}
	
	if (isShot) {
		isShot = false;
		
		updateWaypoints();
		updateSimRenderingSettings();
	}
#endif /* ifdef USE_MAC_CAM */


#ifdef SIM_RENDERING
	simRenderPointCnt += simRenderSpeed;
	if (simRenderPointCnt >= FLT_MAX) {
		simRenderPointCnt = 0.0;
	}
#endif /* ifdef SIM_RENDERING */
    
    myAwesomium.update();

}


//--------------------------------------------------------------
void testApp::updateWaypoints(void) {
    
    int span = 1;
    
	for (int i = 0; i < waypoints.size(); i++) {
		waypoints[i].clear();
	}
	waypoints.clear();
	
	for (int i = 0; i < contFinder.getContours().size(); i++) {
		if (contFinder.getContour(i).size() < 10) {
			continue;
		}
		vector <ofPoint> tmpPoint;
		int cnt = 0;
		for (int j = 0; j < contFinder.getContour(i).size(); j += span) {
			ofPoint point;
			point.x = (float)contFinder.getContours()[i][j].x / mask.width;		// normalized
			point.y = (float)contFinder.getContours()[i][j].y / mask.height;
			tmpPoint.push_back(point);
			cnt++;
			if ( (cnt == WAYPOINTS_LIMIT - 1) || (j == contFinder.getContour(i).size() - 1) ) {
				waypoints.push_back(tmpPoint);
				tmpPoint.clear();
				tmpPoint.push_back(point);
				cnt = 0;
			}
		}
	}
}


//--------------------------------------------------------------
void testApp::updateSimRenderingSettings(void) {
	
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
#endif /* ifdef SIM_RENDERING */
}


//--------------------------------------------------------------
void testApp::draw() {
	ofBackground(0);

	ofNoFill();
	ofSetColor(255);
#ifdef USE_MAC_CAM
	cam.draw(0, 0);	// camera image rendering
	
	// face reagion rendering
	ofSetColor(255, 0, 0);
	ofSetLineWidth(1);
	ofRect(faceRect);
	
	// face mask rendering
	ofSetColor(255);
	if (mask.isAllocated()) {
		mask.draw(maskFrameOffset.x, maskFrameOffset.y);
	}

#else /* ifdef USE_MAC_CAM */
	kinect[0].drawImage(0, 0, CAM_FRAME_SIZE_WIDTH, CAM_FRAME_SIZE_HEIGHT);	// camera image rendering
	
	// user mask rendering
	ofSetColor(255);
	if (mask.isAllocated()) {
		mask.draw(0, EDGE_FRAME_SIZE_HEIGHT, CAM_FRAME_SIZE_WIDTH, CAM_FRAME_SIZE_HEIGHT);
	}
#ifdef DEBUG
	kinect[0].drawSkeletons(0, EDGE_FRAME_SIZE_HEIGHT, CAM_FRAME_SIZE_WIDTH, CAM_FRAME_SIZE_HEIGHT);
#endif /* ifdef DEBUG */
	
	// contour rendering
	for (int i = 0; i < contFinder.getContours().size(); i++) {
		ofRectangle rect;
		rect = toOf(contFinder.getBoundingRect(i));
		rect.x *= ((float)EDGE_FRAME_SIZE_WIDTH / kinect[0].getWidth());
		rect.y *= ((float)EDGE_FRAME_SIZE_HEIGHT / kinect[0].getHeight());
		rect.width *= ((float)EDGE_FRAME_SIZE_WIDTH / kinect[0].getWidth());
		rect.height *= ((float)EDGE_FRAME_SIZE_HEIGHT / kinect[0].getHeight());
		ofSetColor(255, 0, 0);
		ofSetLineWidth(1);
		ofRect(rect);
	}
#endif /* ifdef USE_MAC_CAM */
	
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
	//info += "Rendering Speed: " + ofToString(simRenderSpeed, 2) + "\n";
	//info += "Resolution: " + ofToString(simRenderStep);
	ofDrawBitmapStringHighlight(info, 0, ofGetHeight() - 30);
#endif /* ifdef SIM_RENDERING */

	
#ifdef SIM_RENDERING
	// waypoints rendering
	ofSetColor(0, 255, 0);
	ofFill();
	ofPoint pointPrev;
	ofPoint point;
	int cnt = 0;
	cout << "regions: " << waypoints.size() << endl;
	for (int i = 0; i < waypoints.size(); i++) {
		pointPrev = waypoints[i][0];
		pointPrev *= simRenderScale;
		pointPrev += simRenderOffset;
		cout << " waypoints in region " << i << ": " << waypoints[i].size() << endl;
		for (int j = 0; j < waypoints[i].size(); j = j + simRenderStep) {
			cnt++;
			point = waypoints[i][j];
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
#endif /* ifdef SIM_RENDERING */

    myAwesomium.draw(awesomiumOffset.x, awesomiumOffset.y);
    
    
//#ifdef SIM_RENDERING
    //	// face contour rendering to google Map
    //	ofPoint pointPrev;
    //	ofPoint point;
    //	int cnt = 0;
    //
    //
    //    if(cnt == 0){
    //        cnt ++;
    //    int tmp = 0;
    //    while(wayPoints[tmp].size() < MAX_NUM_MARKER){
    //
    //        tmp ++;
    //
    //    }
    //
    //    double lat, lng;
    //    for(int i=0;i<10;i++){
    //        lat = ofMap(wayPoints[tmp][i].x, 0, CAM_FRAME_SIZE_WIDTH, myAwesomium.minX, myAwesomium.maxX);
    //        lng = ofMap(wayPoints[tmp][i].y, 0, CAM_FRAME_SIZE_HEIGHT, myAwesomium.minY, myAwesomium.maxY);
    //
    //        printf("%lf, %lf\n", lat, lng);
    //
    //        myAwesomium.setMarker(lat, lng);
    //
    //
    //    }
    //    myAwesomium.drawDirection();
    //    }
    //	for (int i = 0; i < wayPoints.size(); i++) {
    //		pointPrev = wayPoints[i][0];
    //		pointPrev *= simRenderScale;
    //		pointPrev += simRenderOffset;
    //
    //
    //        simRenderStep =  round(wayPoints[i].size() / MAX_NUM_MARKER);
    //
    //
    //		for (int j = 0; j < wayPoints[i].size(); j = j + simRenderStep) {
    //			cnt++;
    //			point = wayPoints[i][j];
    //			point *= simRenderScale;
    //			point += simRenderOffset;
    //			if ( cnt > simRenderPointCnt) {
    //				ofCircle(point.x, point.y, 10);
    //				return;
    //			}
    //			ofLine(pointPrev.x, pointPrev.y, point.x, point.y);
    //			pointPrev = point;
    //		}
    //	}
    //	simRenderPointCnt = 0.0;
}

void testApp::setWaypoints(){
    
    ofPoint point;
    double lat,lng;
    
    for(int i=0;i<waypoints.size();i++){
        
        for(int j=0;j<waypoints[i].size();j++){
            
            point = waypoints[i][j];
            
            // point fitting
            float frameScale;
            if(EDGE_FRAME_SIZE_WIDTH > EDGE_FRAME_SIZE_HEIGHT){
                
                frameScale = EDGE_FRAME_SIZE_HEIGHT / (float)EDGE_FRAME_SIZE_WIDTH;
                point.x = ofMap(point.x, 0.0, 1.0, 0.5 - frameScale/2, 0.5 + frameScale/2);
                
            }
            else{
                frameScale = EDGE_FRAME_SIZE_WIDTH / (float)EDGE_FRAME_SIZE_HEIGHT;
                
                point.y = ofMap(point.y, 0.0, 1.0, 0.5 - frameScale/2, 0.5 + frameScale/2);
            }
            
            
            // NOTE: lat-> y axix, lng -> x axix
            
            lat = myAwesomium.minLat + ( myAwesomium.maxLat - ofMap(point.y, 0, 1.0, myAwesomium.minLat, myAwesomium.maxLat));
            lng = ofMap(point.x, 0, 1.0, myAwesomium.minLng, myAwesomium.maxLng);
            
            //myAwesomium.setMarker(lat, lng);
            if(j == 0 && i != 0){
                
                myAwesomium.setMarkerOfWaypoint(lat, lng, 100);
                
                myAwesomium.setNumLine();
                myAwesomium.setDebugVal();
                
                
            }
            else{
                
                myAwesomium.setMarkerOfWaypoint(lat, lng, 0);
                
                
            }
        }
    }
    
    cout<<"waypoints size:"<<waypoints.size()<<endl;
    
    cout<<"finished set mark"<<endl;

    
}


#ifndef USE_MAC_CAM
//--------------------------------------------------------------
void testApp::userEvent(ofxOpenNIUserEvent & event){
	ofLogNotice() << getUserStatusAsString(event.userStatus) << "for user" << event.id << "from device" << event.deviceID;
}
#endif

void testApp::keyPressed( int key ) {
	
#ifdef USE_MAC_CAM
	
	if ( (key == ' ') && (faceFinder.size() != 0)) {
		isShot = true;
	}
    
    if(key == 'a'){
        setWaypoints();
        myAwesomium.drawFaceWithDirection();
    }
    
    if(key == 'r'){
    
        myAwesomium.resetMap();
        
    }
    
    if(key == '1'){
        
        myAwesomium.mapZoomUp();
    
    }
    
    if(key == '2'){
     
        myAwesomium.mapZoomDown();
        
    }
    
	
#else /* ifdef USE_MAC_CAM */
	switch (key) {
		case ' ':
			isShot = true;
			break;
			
		case 'x':
            for (int deviceID = 0; deviceID < numDevices; deviceID++){
                kinect[deviceID].stop();
            }
            break;
		
		case 'a':
            setWaypoints();
            myAwesomium.drawFaceWithDirection();
			break;
            
        case 'r':
            myAwesomium.resetMap();
            break;
            
        case '1':
            myAwesomium.mapZoomUp();
            break;
            
        case '2':
            myAwesomium.mapZoomDown();
            break;
            
	}
#endif /* ifdef USE_MAC_CAM */
	
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
    
#endif /* ifdef SIM_RENDERING */
    
    
}


//--------------------------------------------------------------
void testApp::mouseDragged(int x, int y, int button) {
    
    myAwesomium.mouseDragged(x-CAM_FRAME_SIZE_WIDTH, y, button);

}

void testApp::mousePressed(int x, int y, int button) {

    myAwesomium.mousePressed(x-CAM_FRAME_SIZE_WIDTH, y, button);
    
}

void testApp::mouseReleased(int x, int y, int button) {

    myAwesomium.mouseReleased(x-CAM_FRAME_SIZE_WIDTH, y, button);
    
    
}
