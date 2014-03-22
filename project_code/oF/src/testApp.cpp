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
    
    myAwesomium.setup(MAP_FRAME_SIZE_WIDTH, MAP_FRAME_SIZE_HEIGHT);
    awesomiumOffset.x = CAM_FRAME_SIZE_WIDTH;
    awesomiumOffset.y = 0;
    
    
    frameRate = 0;
    drawFlag  = false;
        
    
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
			for (int i = 0; i < waypoints.size(); i++) {
				waypoints[i].clear();
			}
			waypoints.clear();
			
			for (int i = 0; i < contFinder.getContours().size(); i++) {
				if (contFinder.getContour(i).size() < 10) {
					continue;
				}
				vector <ofPoint> tmpPoint;
				for (int j = 0; j < contFinder.getContour(i).size(); j++) {
					ofPoint point;
					point.x = (float)contFinder.getContours()[i][j].x / edge.width;		// normalized
					point.y = (float)contFinder.getContours()[i][j].y / edge.height;
					tmpPoint.push_back(point);
					if ( (j % WAYPOINTS_LIMIT == WAYPOINTS_LIMIT - 1) || (j == contFinder.getContour(i).size() - 1) ) {
						waypoints.push_back(tmpPoint);
						tmpPoint.clear();
					}
				}
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
    
    myAwesomium.update();
    
//    if(drawFlag){
//    
//        myAwesomium.drawFaceWithDirection();
//        
//    }
    
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

//#ifdef SIM_RENDERING
	// string rendering
	ofSetColor(255);
	ofFill();
	string info = "Frame Rate: " + ofToString(ofGetFrameRate(), 2) + "\n";
	//info += "Rendering Speed: " + ofToString(simRenderSpeed, 2) + "\n";
	//info += "Resolution: " + ofToString(simRenderStep);
	ofDrawBitmapStringHighlight(info, 0, ofGetHeight() - 30);
//#endif
	
#ifdef SIM_RENDERING
	// face contour rendering
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
#endif
    
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
    
    cout<<"finished set mark"<<endl;

    
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
    
    
    if(key == 'a'){
        
        setWaypoints();
        myAwesomium.drawFaceWithDirection();
        
    }
    
    if(key =='q'){
    
        myAwesomium.drawFaceWithDirection();
    
    }
    
    if(key == 'r'){
    
        myAwesomium.resetMap();
        
    }
    
    if(key == '1'){
    
        ofPoint test;
        test.y = ofMap(ofGetHeight()/2, 0, ofGetHeight(), myAwesomium.minLat, myAwesomium.maxLat);
        test.x = ofMap(10, 0, ofGetWidth(), myAwesomium.minLng, myAwesomium.maxLng);
        
        myAwesomium.setMarker(test.y, test.x);
    }
    

    
    //myAwesomium.keyPressed(key);
}

void testApp::mouseDragged(int x, int y, int button) {

}

void testApp::mousePressed(int x, int y, int button) {

}

void testApp::mouseReleased(int x, int y, int button) {

}
