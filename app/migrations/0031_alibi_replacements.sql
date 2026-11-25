-- Alibi replacements (2026-11-24). Alibi marks 34 of our listings "This item has been replaced with ...".
-- 15 replacement models we did not carry are added here (MSRP x 0.95 rounded down to .99). Dealer cost is not kept in
-- the repo: it is written straight to D1 after deploy. The 34 old listings are hidden (active = 0,
-- kept for past orders) and /p/<old> 301s to the replacement via product_redirects.
-- Held back on purpose: FB81-LUA-D, FT81-LUA-D, NR323P-8-D, NR041F-1-D (odd replacements, owner to ask Alibi rep),
-- FD40-VUA-D, FD41-VU-D, PD40-VUAI-D, PT50-UAIB-D (Alibi's replacement page does not exist yet).
INSERT OR IGNORE INTO products (slug,name,brand,brand_slug,category,price_cents,msrp_cents,cost_cents,blurb,image,featured,stock,stock_tracked,active,specs,meta_title,meta_description,meta_keywords,gtin,mpn,highlights,badges,options,addon) VALUES ('ali-pb81-vluai-d','Alibi ALI-PB81-VLUAI-D Vigilant Performance Series 8 MP Starlight+ IllumiNite SmartSense Fixed IP Bullet Camera','ALIBI','alibi','security-ip-cameras',56999,59999,NULL,'**Alibi Vigilant Performance Series 8 MP Starlight+ IllumiNite SmartSense Fixed IP Bullet Camera**
SKU ALI-PB81-VLUAI-D

The Alibi Vigilant Performance Series security camera delivers crisp video day or night with a Starlight+ chipset and IllumiNite white light LED technology that helps you capture color video 24/7.

This product has been specifically designed and manufactured to comply with the latest technical requirements specified under NDAA regulations.

**Multi-megapixel resolution – Get more detail from your video camera.** This camera captures multi-megapixel high-resolution video footage that delivers crisp, precise detail and clarity for your video security needs.

**IllumiNite Technology produces color video 24/7 –** lllumiNite cameras feature powerful white light LEDs built-in below the lens to capture color video all day and night. LEDs can be set to activate on motion events or via a fixed schedule.

**Starlight+ chipset -** Starlight+ technology uses ambient light sources to capture color video in extreme low light conditions. These cutting edge chipsets utilize ambient light sources (including starlight) to produce color images at night.

**Ultra H.265 Compression – reduce bandwidth and storage requirements.** With Ultra H.265 compression technology, you can store more information using less hard drive space. Ultra H.265 also helps you minimize bandwidth requirements for high-resolution video and makes the remote viewing less demanding on the recorder.

**2D/3D Digital Noise Reduction (DNR)** effectively filters noise to produce a crisper, clear video stream.

**IP67 weatherproof housing -** this turret camera delivers long-term durability even among extreme weather conditions such as rain, snow, and ice and has a wide temperature range of -22 degrees to 140 degrees Fahrenheit.

**True Day/Night feature** – allowing you to capture better images in any lighting conditions.

**Innovative Day/Night Scene Detection** – includes a hardware sensor for smart software imaging that detects surveillance scene illumination. Designed to be water and dust-proof, this allows you to avoid unexpected costs of hardware failure.

**HTML5 Plugin Free –** use on almost any Browser for support:

Plug-in required live view: IE9+, Chrome 41 and below, Firefox 52 and below
Plug-in free live view: Chrome 57.0+, Firefox 58.0+, Edge 16+, Safari 11+

**Intuitive interface – everything you need to manage your system at your fingertips.** With an intuitive interface and access to the free Vigilant Mobile App and Vigilant CMS, system management has never been simpler.

**SmartSense technology** – utilizes AI deep learning developed data algorithms to identify human and vehicular targets with extreme accuracy and reduce false alarms.

**What’s Included:**

(1) Alibi Vigilant Performance Series security camera
(1) Mounting template
(1) Mounting hardware
(1) Quick start guide

**Protection and Warranty:**

Covered by Alibi''s 3-Year Warranty on the camera and recorder hardware and components, with unlimited US-based technical support. Questions before or after you buy? Call the shop and we will help you choose and set it up.','/img/alibi/ali-pb81-vluai-d-1.jpg',0,0,0,1,'Audio	Yes
Audio Compression	G.711U, G.711A
Audio Streaming	Two-way
Sensor Inputs	1
Alarm Outputs	1
Audio In	1
Audio Out	1
Lux (B/W)	0.0 (IR ON)
Lux (Color)	0.0003
Megapixel	8.0 (4K)
Illumination Distance (ft)	131
Digital Noise Reduction (DNR)	2D + 3D DNR
Dynamic Range (dB)	130
Electronic Shutter	1 ~ 1/100,000 sec
Imager Type	CMOS
Wide Dynamic	Yes
Pan Angle	0° ~ 360°
Rotate Angle	0° ~ 360°
Operating Temperature (F)	-40° ~ 140°
Operating Humidity	0% ~ 95% (non-condensing)
Weight (lb)	2.0
Vandal-proof	IK10
Construction	Metal + Plastic
Certification	CE-LVD, CE-ROHS, CE-EMC, EN, IEC, UL, FCC CFR 47 Part 15
Dimensions	10.4" × 3.7" × 3.3"
Ingress Protection	IP67
Focal Length (mm)	2.8mm
Lens Type	Fixed
Lens Iris	fixed
FOV (Field of View)	105°
Compatibility	Alibi Cloud VS, Ai-RGUS (ONVIF), Avigilon (ONVIF), Digital Watchdog (ONVIF), Exacq Vision (ONVIF), Network Optix (ONVIF), Open Eye (ONVIF), Salient (ONVIF)
Compatible Integrations	ONVIF (Profile S, Profile G, Profile T, Profile M), API, SDK
Power (w)	DC12V(±25%), PoE(IEEE 802.3af); Max 11W
Storage Capacity (GB)	Up to 512 (micro SD card not included)
Bit Rate	128 Kbps ~ 16 Mbps
Starlight +	Yes
Active Deterrent	No
NDAA Compliant	Yes
Reset Button	Yes
Brand	Alibi Vigilant
Warranty	3-Year
https://www.alibisecurity.com/media/docs/ali-pb81-vluai-d-datasheet-as.pdf
https://www.alibisecurity.com/blog/post/alibi-product-matrix
https://www.alibisecurity.com/blog/post/alibi-vigilant-mobile-app
https://www.alibisecurity.com/blog/post/power-distance
https://www.alibisecurity.com/media/docs/ali-vig-ipc-usermanual-br.pdf
https://www.alibisecurity.com/media/docs/ip-camera-installation-guide.pdf
https://www.alibisecurity.com/blog/post/alibi-vigilant-camera-firmware','Alibi ALI-PB81-VLUAI-D 8 MP Starlight+ IllumiNite SmartSense Fixed','Alibi ALI-PB81-VLUAI-D 8 MP Starlight+ IllumiNite SmartSense Fixed. NDAA compliant. Authorized Alibi dealer, ships from New York.','alibi, ali-pb81-vluai-d, starlight, ip camera, bullet camera, ndaa','','ALI-PB81-VLUAI-D','8MP IP bullet camera
2.8 mm wide angle lens with 105° FOV
Starlight+ Chipset (.0003 lux) for color in low-light conditions
Built-in white light LEDs for color video 24/7
1/1 Alarm in/out; 1/1 audio in/out
Built-in microphone
2D/3D Digital Noise Reduction (DNR)
Supports 512 GB micro SD card
IP67 weather resistant rating
IK10 vandal resistant rating
ONVIF (Profile S, Profile G, Profile T, Profile M)
SmartSense AI Analytics reduces false alarms by 95% for human and vehicle detection events
NDAA Compliant','[{"label": "NDAA", "detail": "NDAA Compliant - meets the product technical requirements of NDAA Section 889", "icon": "/media/p_f8cbae82-4349-48a6-83af-8cebe63cdd9a.png"}, {"label": "Starlight", "detail": "Starlight chipset with a super low light LUX rating", "icon": "/media/p_03ae7540-e2b2-4a7a-88cb-2d1ce56fae41.png"}, {"label": "Audio Mic", "detail": "Includes Built-in mic.", "icon": "/media/p_06f9cc60-9191-48c6-8bc9-95cf6fc8c7c1.png"}, {"label": "IP67", "detail": "IP67 Weather Rated Enclosure – Ideal for outdoor applications", "icon": "/media/p_1f4ccdb1-34be-4c19-9c10-39878257ce7d.png"}, {"label": "WDR", "detail": "Wide Dynamic Range – Gain better images in diverse lighting conditions", "icon": "/media/p_3b868fc0-904f-4642-bfcc-6944396dd866.png"}, {"label": "IK10", "detail": "IK10 rated vandalproof housing - resists impact effectively", "icon": "/media/p_34b15106-5e79-4128-8f1a-668de435eefb.png"}, {"label": "3D-DNR", "detail": "3D Digital Noise Reduction – Get exceptional video image quality with less noise", "icon": "/media/p_218ec18d-0a39-4fa6-8850-6f3f5af393ba.png"}, {"label": "ONVIF", "detail": "ONVIF Certified", "icon": "/media/p_e020abd0-1488-40b5-b565-6e2dc8f15bff.png"}]','',0);
INSERT OR IGNORE INTO products (slug,name,brand,brand_slug,category,price_cents,msrp_cents,cost_cents,blurb,image,featured,stock,stock_tracked,active,specs,meta_title,meta_description,meta_keywords,gtin,mpn,highlights,badges,options,addon) VALUES ('ali-fd82-vua-d','Alibi ALI-FD82-VUA-D Vigilant Flex Series 8MP Starlight Vandal Resistant IP Fixed Dome Camera','ALIBI','alibi','security-ip-cameras',32299,33999,NULL,'**Alibi Vigilant Flex Series 8MP Starlight Vandal Resistant IP Fixed Dome Camera**
SKU ALI-FD82-VUA-D

**NDAA Compliant Security** - This security camera delivers high-resolution, crisp video at day or night and has been specifically designed and manufactured to comply with the latest technical requirements specified under NDAA regulations.

**Multi-Megapixel Resolution Video –** this camera captures ultra-high definition video during the day and at night for ultra-crisp and clear footage.

**Capture Color Video at Night –** Starlight technology chipset uses ambient light sources to capture color video footage in extreme low light conditions.

**Superior Outdoor IP67 weatherproof housing** – With an IP67 weather-rated metal enclosure, this dome camera has a wide temperature range of -22 degrees to 140 degrees Fahreneheit – offering long-term durability even among extreme weather conditions such as rain, snow, and ice.

**3D Digital Noise Reduction (DNR**) effectively filters noise to produce a more crisp, clear video stream.

**IK10** vandalproof rating for tamper-proof installations

**Full Frame Illumination with Smart IR -**Smart full-frame illumination technology offers several advantages over standard IR for flawless night vision, including:

Clearer, brighter images in low light and at night
Delivers a wider illumination spread
Unique rectangular IR LED design produces a uniformly illuminated image across the entire screen
Reduces overexposure at the center of the image and eliminates hot spots
Eliminates blooming from lights by reducing ambient light pollution
Reduces video noise for a clearer nighttime picture, and reduces bandwidth consumption and video storage requirements

**HTML5 Plugin Free –** use on almost any Browser for support:

Plug-in required live view: IE9+, Chrome 41 and below, Firefox 52 and below
Plug-in free live view: Chrome 57.0+, Firefox 58.0+, Edge 16+, Safari 11+

**Ultra H.265 Compression – reduce bandwidth and storage requirements.** Smore information using less hard drive space. Ultra H.265 also helps you minimize bandwidth requirements for high-resolution video and makes remote viewing less demanding on the recorder.

**Intuitive interface – everything you need to manage your system at your fingertips.** With an intuitive interface, along with access to the free Vigilant Mobile App and Viligant CMS, system management has never been simpler.

**What’s Included:**

(1) 8MP IP fixed lens dome security camera
(1) Mounting template
(1) Mounting hardware
(1) Quick start guide

**Protection and Warranty:**

Covered by Alibi''s 3-Year Warranty on the camera and recorder hardware and components, with unlimited US-based technical support. Questions before or after you buy? Call the shop and we will help you choose and set it up.','/img/alibi/ali-fd82-vua-d-1.jpg',0,0,0,1,'Audio	Yes
Audio Compression	G.711U, G.711A
AGC Control	Yes
Lux (B/W)	0.0 (IR ON)
Lux (Color)	0.005
Megapixel	8.0 (4K)
OSD	Yes
IR Wavelength (nm)	850
Illumination Distance (ft)	98
Day/Night Function	ICR (Auto/Day/Night)
Digital Noise Reduction (DNR)	2D + 3D DNR
Dynamic Range (dB)	120
Electronic Shutter	1 ~ 1/100,000 sec
Flip	Yes
Imager Size (in)	1/2.7
Imager Type	Progressive Scan CMOS
Wide Dynamic	Yes
Product Color	White
Pan Angle	8° ~ 360°
Rotate Angle	10° ~ 360°
Outdoor	Yes
Operating Temperature (F)	-22° ~ 140°
Operating Humidity	0% ~ 95% (non-condensing)
Weight (lb)	1.0
Vandal-proof	IK10
Tilt Angle	0° ~ 65°
Construction	Plastic and Metal Alloy
Certification	CE-EMC (EN 55032, EN 61000-3-3, EN IEC 61000-3-2, EN 55035) FCC (FCC 47 CFR part15 B) CE LVD (EN 62368-1) UL/CUL (UL 62368-1, CAN/CSA C22.2 No. 62368-1) CE-RoHS (2011/65/EU;(EU)2015/863); WEEE (2012/19/EU);
Card Reader Type	Micro SD
Dimensions	Ø4.4 x 3.3
Ingress Protection	IP67
Focal Length (mm)	2.8
Relative Aperture (F-stop)	F1.6
Lens Type	Fixed
Lens Mount	M12
FOV (degrees)	112.5°
802.3	802.3af
Compatible Integrations	ONVIF (Profile S, Profile G, Profile T), API, SDK
Ethernet Ports	1
Ethernet Interface	10/100 BASE-TX
Power (w)	12 Vdc ±25%, PoE (IEEE 802.3af), Max: 4.5 W
Privacy Video Block	Yes
Storage Capacity (GB)	Up to 512 (micro SD card not included)
Motion Detection	Yes
Bit Rate	128 Kbps ~ 16 Mbps
Compression Type	Ultra265, H.265, H.264, MJPEG
Mobile App	iOS & Android
Active Deterrent	No
NDAA Compliant	Yes
Reset Button	Yes
Brand	Alibi Vigilant
Warranty	3-Year
https://www.alibisecurity.com/media/docs/ali-fd82-vua-d-datasheet-as.pdf
https://www.alibisecurity.com/blog/post/alibi-product-matrix
https://www.alibisecurity.com/blog/post/alibi-vigilant-mobile-app
https://www.alibisecurity.com/blog/post/power-distance
https://www.alibisecurity.com/media/docs/ali-vig-ipc-usermanual-br.pdf
https://www.alibisecurity.com/blog/post/alibi-vigilant-camera-firmware','Alibi ALI-FD82-VUA-D 8MP Starlight Vandal Resistant IP Fixed Dome Camera','Alibi ALI-FD82-VUA-D 8MP Starlight Vandal Resistant IP Fixed Dome Camera. NDAA compliant. Authorized Alibi dealer, ships from New York.','alibi, ali-fd82-vua-d, starlight, ip camera, dome camera, ndaa','','ALI-FD82-VUA-D','High quality image with 8 MP, 1/2.8" CMOS sensor
8 MP (3840 × 2160)@20 fps
Ultra 265, H.265, H.264, MJPEG
120 dB true WDR technology enables clear image in strong light scene
Supports 9:16 corridor mode
Built-in mic
Smart IR, up to 30 m (98.4 ft.) IR distance
MicroSD, up to 512 GB
IP67 protection IK10 protection
Supports PoE power supply
3-axis','[{"label": "NDAA", "detail": "NDAA Compliant - meets the product technical requirements of NDAA Section 889", "icon": "/media/p_f8cbae82-4349-48a6-83af-8cebe63cdd9a.png"}, {"label": "Starlight", "detail": "Starlight chipset with a super low light LUX rating", "icon": "/media/p_03ae7540-e2b2-4a7a-88cb-2d1ce56fae41.png"}, {"label": "Audio Mic", "detail": "Includes Built-in mic.", "icon": "/media/p_06f9cc60-9191-48c6-8bc9-95cf6fc8c7c1.png"}, {"label": "IP67", "detail": "IP67 Weather Rated Enclosure – Ideal for outdoor applications", "icon": "/media/p_1f4ccdb1-34be-4c19-9c10-39878257ce7d.png"}, {"label": "WDR", "detail": "Wide Dynamic Range – Gain better images in diverse lighting conditions", "icon": "/media/p_3b868fc0-904f-4642-bfcc-6944396dd866.png"}, {"label": "IK10", "detail": "IK10 rated vandalproof housing - resists impact effectively", "icon": "/media/p_34b15106-5e79-4128-8f1a-668de435eefb.png"}, {"label": "3D-DNR", "detail": "3D Digital Noise Reduction – Get exceptional video image quality with less noise", "icon": "/media/p_218ec18d-0a39-4fa6-8850-6f3f5af393ba.png"}, {"label": "ONVIF", "detail": "ONVIF Certified", "icon": "/media/p_e020abd0-1488-40b5-b565-6e2dc8f15bff.png"}]','',0);
INSERT OR IGNORE INTO products (slug,name,brand,brand_slug,category,price_cents,msrp_cents,cost_cents,blurb,image,featured,stock,stock_tracked,active,specs,meta_title,meta_description,meta_keywords,gtin,mpn,highlights,badges,options,addon) VALUES ('ali-ft41-a-d','Alibi ALI-FT41-A-D Vigilant Flex Series 4MP IP Fixed Turret Network Camera','ALIBI','alibi','security-ip-cameras',13299,13999,NULL,'**Alibi Vigilant Flex Series 4MP IP Fixed Turret Network Camera**
SKU ALI-FT41-A-D

The Alibi Vigilant Flex Series 4MP Fixed Turret Security Camera delivers crisp video day or night.

This product has been specifically designed and manufactured to comply with the latest technical requirements specified under NDAA regulations.

**Multi-Megapixel Resolution Video –** 4MP camera captures a high level of clarity and detail for most applications

**IP67 weatherproof housing** this turret camera has a wide temperature range of -22 degrees to 140 degrees Fahrenheit – delivering long-term durability even among extreme weather conditions such as rain, snow, and ice.

**Key Features and Capabilities**

**Multi-megapixel resolution – Get more detail from your video camera.** This camera captures multi-megapixel resolution video footage that delivers crisp, precise detail and clarity for your video security needs.

**Innovative Day/Night Scene Detection** – includes a hardware sensor for smart software imaging that detects surveillance scene illumination. Designed to be water and dust-proof, this allows you to avoid unexpected costs of hardware failure.

**HTML5 Plugin Free –** use on almost any Browser for support:

Plug-in required live view: IE9+, Chrome 41 and below, Firefox 52 and below
Plug-in free live view: Chrome 57.0+, Firefox 58.0+, Edge 16+, Safari 11+

**Ultra H.265 Compression – reduce bandwidth and storage requirements.** With Ultra H.265 compression technology, you can store more information using less hard drive space. Ultra H.265 also helps you minimize bandwidth requirements for high-resolution video and makes the remote viewing less demanding on the recorder.

**Intuitive interface – everything you need to manage your system at your fingertips.** With an intuitive interface, along with access to the free Vigilant Mobile App and Vigilant CMS, system management has never been simpler.

**What’s Included:**

(1) 4MP fixed turret security camera
(1) Mounting template
(1) Mounting hardware
(1) Quick start guide

**Protection and Warranty:**

Covered by Alibi''s 3-Year Warranty on the camera and recorder hardware and components, with unlimited US-based technical support. Questions before or after you buy? Call the shop and we will help you choose and set it up.','/img/alibi/ali-ft41-a-d-1.jpg',0,0,0,1,'Audio	Yes
AGC Control	Yes
Lux (B/W)	0.0 (IR ON)
Lux (Color)	0.01
Megapixel	4.0
OSD	Yes
Camera Resolution (px)	4MP (2560*1440), Max 25fps
Illumination Distance (ft)	98
Color	Yes
Day/Night Function	ICR (Auto/Day/Night)
Digital Noise Reduction (DNR)	2D + 3D DNR
Electronic Shutter	1 ~ 1/100,000 sec
Imager Size (in)	1/3
Imager Type	CMOS
Wide Dynamic	D-WDR
Product Color	White
Pan Angle	0˚ ~ 360˚
Rotate Angle	0˚ ~ 360˚
Outdoor	Yes
Operating Temperature (F)	- 22 °F ~ 140°F
Operating Humidity	0% ~ 95%
Weight (lb)	0.6
Certification	CE/FCC
Dimensions	5.0 × 3.9
Ingress Protection	IP67
Focal Length (mm)	2.8
Relative Aperture (F-stop)	F2.0
Lens Type	Fixed
FOV (Field of View)	94.3
802.3	802.3af
Compatibility	Alibi Cloud VS, Eagle Eye VMS, Ai-RGUS (ONVIF), Avigilon (ONVIF), Digital Watchdog (ONVIF), Exacq Vision (ONVIF), Network Optix (ONVIF), Open Eye (ONVIF), Salient (ONVIF)
Ethernet Ports	1
Ethernet Interface	RJ-45, 10/100, BASE-T
Power Supply Included	No
Power (w)	DC 12V±25%, PoE (IEEE 802.3af)  Max 3.9W
Privacy Video Block	Yes
Selectable Frame Rate	Yes
Storage Capacity (GB)	Up to 512 (micro SD card not included)
Motion Detection	Yes
Mobile App	iOS & Android
Active Deterrent	No
NDAA Compliant	Yes
Brand	Alibi Vigilant
Warranty	3-Year
https://www.alibisecurity.com/media/docs/ali-ft41-a-d-datasheet-as.pdf
https://www.alibisecurity.com/blog/post/alibi-product-matrix
https://www.alibisecurity.com/blog/post/alibi-vigilant-mobile-app
https://www.alibisecurity.com/blog/post/power-distance
https://www.alibisecurity.com/media/docs/ali-vig-ipc-usermanual-br.pdf
https://www.alibisecurity.com/blog/post/alibi-vigilant-camera-firmware','Alibi ALI-FT41-A-D 4MP IP Fixed Turret Network Camera','Alibi ALI-FT41-A-D 4MP IP Fixed Turret Network Camera. NDAA compliant. Authorized Alibi dealer, ships from New York.','alibi, ali-ft41-a-d, ip camera, turret camera, ndaa','','ALI-FT41-A-D','4MP IP turret camera
2.8mm lens
94.3 degrees Field of View
DORI Distance: Detect 63.0m, Observe 25.2m, Recognize 12.6m, Identify 6.3m
98 feet Smart IR’ Distance
.01 low-light Lux Rating
Built-In Microphone
Supports Ultra H.265, H.265, H.264
DWDR (Digital Wide Dynamic Range)
Supports up to 512GB Micro SD-Card
NDAA compliant
IP67 rating – withstands temps from -22 degrees to 140 degrees Fahrenheit','[{"label": "NDAA", "detail": "NDAA Compliant - meets the product technical requirements of NDAA Section 889", "icon": "/media/p_f8cbae82-4349-48a6-83af-8cebe63cdd9a.png"}, {"label": "Audio Mic", "detail": "Includes Built-in mic.", "icon": "/media/p_06f9cc60-9191-48c6-8bc9-95cf6fc8c7c1.png"}, {"label": "IP67", "detail": "IP67 Weather Rated Enclosure – Ideal for outdoor applications", "icon": "/media/p_1f4ccdb1-34be-4c19-9c10-39878257ce7d.png"}, {"label": "WDR", "detail": "Wide Dynamic Range – Gain better images in diverse lighting conditions", "icon": "/media/p_3b868fc0-904f-4642-bfcc-6944396dd866.png"}, {"label": "3D-DNR", "detail": "3D Digital Noise Reduction – Get exceptional video image quality with less noise", "icon": "/media/p_218ec18d-0a39-4fa6-8850-6f3f5af393ba.png"}, {"label": "ONVIF", "detail": "ONVIF Certified", "icon": "/media/p_e020abd0-1488-40b5-b565-6e2dc8f15bff.png"}]','',0);
INSERT OR IGNORE INTO products (slug,name,brand,brand_slug,category,price_cents,msrp_cents,cost_cents,blurb,image,featured,stock,stock_tracked,active,specs,meta_title,meta_description,meta_keywords,gtin,mpn,highlights,badges,options,addon) VALUES ('ali-ft41-la-d','Alibi ALI-FT41-LA-D Vigilant 4MP 98 Feet Dual Light IR IP Turret Camera w/ Built-in Mic','ALIBI','alibi','security-ip-cameras',15199,15999,NULL,'**Alibi Vigilant 4MP 98 Feet Dual Light IR IP Turret Camera w/ Built-in Mic**
SKU ALI-FT41-LA-D

The Alibi Vigilant Flex Series, 4MP Turret Security Camera delivers crisp video day or night.

**Superior Outdoor Performance** – With an IP67 weather-rated metal enclosure, this turret camera offers long-term durability even among extreme weather conditions such as rain, snow, and ice and has a wide temperature range of -22 degrees to 140 degrees Fahrenheit.

**3D Digital Noise Reduction (DNR**) - effectively filters noise to produce a crisper, clear video stream.

**Key Features and Capabilities**

**Multi-megapixel resolution – Get more detail from your video camera.** This camera captures multi-megapixel resolution video footage that delivers crisp, clear detail and clarity for your video security needs.

Clearer, brighter images in low light and at night
Delivers a wider illumination spread
Reduces overexposure at the center of the image and eliminates hot spots
Eliminates blooming from lights by reducing ambient light pollution
Reduces video noise for a clearer nighttime picture and reduces bandwidth consumption and video storage requirements

**Innovative Day/Night Scene Detection** – includes a hardware sensor for intelligent software imaging that detects surveillance scene illumination. Designed to be water and dust-proof, this allows you to avoid unexpected costs of hardware failure

**HTML5 Plugin Free –** use on almost any Browser for support:

Plug-in required live view: IE9+, Chrome 41 and below, Firefox 52 and below
Plug-in free live view: Chrome 57.0+, Firefox 58.0+, Edge 16+, Safari 11+

**Ultra H.265 Compression – reduce bandwidth and storage requirements.** With Ultra H.265 compression technology, you can store more information using less hard drive space. Ultra H.265 also helps you minimize bandwidth requirements for high-resolution video and makes the remote viewing less demanding on the recorder.

**Intuitive interface – everything you need to manage your system at your fingertips.** System management has never been simpler with an intuitive interface and access to the free Vigilant Mobile App and Vigilant CMS.

**What’s Included:**

(1) Alibi Vigilant Flex Series 4MP turret security camera
(1) Mounting template
(1) Mounting hardware
(1) Quick start guide

**Protection and Warranty:**

Covered by Alibi''s 3-Year Warranty on the camera and recorder hardware and components, with unlimited US-based technical support. Questions before or after you buy? Call the shop and we will help you choose and set it up.','/img/alibi/ali-ft41-la-d-1.jpg',0,0,0,1,'Audio	Yes
Audio Compression	G.711U, G.711A
AGC Control	Yes
Lux (B/W)	0.0
Lux (Color)	0.01
Megapixel	4.0
OSD	Yes
IR Wavelength (nm)	850
Illumination Distance (ft)	98
Digital Noise Reduction (DNR)	2D + 3D DNR
Dynamic Range (dB)	More than 52db
Electronic Shutter	1 ~ 1/100,000 sec
Flip	Yes
Imager Size (in)	1/3
Imager Type	CMOS
Wide Dynamic	D-WDR
Product Color	White/Black
Pan Angle	0° ~ 360°
Rotate Angle	0° ~ 360°
Outdoor	Yes
Operating Temperature (F)	-22° ~ 140°
Operating Humidity	0% ~ 95% (non-condensing)
Weight (lb)	0.6
Construction	Metal + Plastic
Certification	CE-EMC, FCC, CE LVD, UL/CUL, CE-RoHS
Dimensions	Ø4.6" x 3.9"
Ingress Protection	IP67
Focal Length (mm)	2.8
Relative Aperture (F-stop)	F1.6
Lens Type	Fixed
Lens Iris	fixed
FOV (Field of View)	93.2 Degrees
802.3	802.3af
Compatibility	Ai-RGUS (ONVIF), Avigilon (ONVIF), Digital Watchdog (ONVIF), Exacq Vision (ONVIF), Network Optix (ONVIF), Open Eye (ONVIF), Salient (ONVIF)
Ethernet	Yes
Power Supply Included	No
Power (w)	12V±25%, PoE (IEEE 802.3af), MAX: 4.2W
Privacy Video Block	Yes
Storage Capacity (GB)	Up to 512 (micro SD card not included)
Motion Detection	Yes
Compression Type	Ultra265, H.265, H.264, MJPEG
Mobile App	iOS & Android
Active Deterrent	No
NDAA Compliant	Yes
Reset Button	Yes
Brand	Alibi Vigilant
Warranty	3-Year
https://www.alibisecurity.com/media/docs/ali-ft41-la-d-datasheet-as.pdf
https://www.alibisecurity.com/blog/post/alibi-product-matrix
https://www.alibisecurity.com/blog/post/alibi-vigilant-mobile-app
https://www.alibisecurity.com/blog/post/power-distance
https://www.alibisecurity.com/media/docs/ali-vig-ipc-usermanual-br.pdf
https://www.alibisecurity.com/media/docs/ip-camera-installation-guide.pdf
https://www.alibisecurity.com/blog/post/alibi-vigilant-camera-firmware','Alibi ALI-FT41-LA-D 4MP 98 Feet Dual Light IR IP Turret Camera','Alibi ALI-FT41-LA-D 4MP 98 Feet Dual Light IR IP Turret Camera. NDAA compliant. Authorized Alibi dealer, ships from New York.','alibi, ali-ft41-la-d, ip camera, turret camera, ndaa','','ALI-FT41-LA-D','High quality image with 4MP, 1/3" CMOS sensor
4 MP (2560 × 1440)@25/20 fps; 3 MP (2304 × 1296)@30/25 fps; 1080P (1920 × 1080)@30/25 fps
Ultra 265, H.265, H.264, MJPEG
120dB true WDR technology enables clear image in strong light scene
Support Corridor Mode
Built-in Mic
Up to 30m (98ft) warm light distance
Supports 512 G Micro SD card
IP67 protection
Support PoE power supply
3-Axis','[{"label": "NDAA", "detail": "NDAA Compliant - meets the product technical requirements of NDAA Section 889", "icon": "/media/p_f8cbae82-4349-48a6-83af-8cebe63cdd9a.png"}, {"label": "Audio Mic", "detail": "Includes Built-in mic.", "icon": "/media/p_06f9cc60-9191-48c6-8bc9-95cf6fc8c7c1.png"}, {"label": "IP67", "detail": "IP67 Weather Rated Enclosure – Ideal for outdoor applications", "icon": "/media/p_1f4ccdb1-34be-4c19-9c10-39878257ce7d.png"}, {"label": "WDR", "detail": "Wide Dynamic Range – Gain better images in diverse lighting conditions", "icon": "/media/p_3b868fc0-904f-4642-bfcc-6944396dd866.png"}, {"label": "3D-DNR", "detail": "3D Digital Noise Reduction – Get exceptional video image quality with less noise", "icon": "/media/p_218ec18d-0a39-4fa6-8850-6f3f5af393ba.png"}, {"label": "ONVIF", "detail": "ONVIF Certified", "icon": "/media/p_e020abd0-1488-40b5-b565-6e2dc8f15bff.png"}]','',0);
INSERT OR IGNORE INTO products (slug,name,brand,brand_slug,category,price_cents,msrp_cents,cost_cents,blurb,image,featured,stock,stock_tracked,active,specs,meta_title,meta_description,meta_keywords,gtin,mpn,highlights,badges,options,addon) VALUES ('ali-ft80-la-d','Alibi ALI-FT80-LA-D Vigilant 8MP 98 Feet Dual Light IR IP Turret Camera w/ Built-in Mic','ALIBI','alibi','security-ip-cameras',24699,25999,NULL,'**Alibi Vigilant 8MP 98 Feet Dual Light IR IP Turret Camera w/ Built-in Mic**
SKU ALI-FT80-LA-D

The Alibi Vigilant Flex Series, 8MP Turret Security Camera delivers crisp video day or night.

**Superior Outdoor Performance** – With an IP67 weather-rated metal enclosure, this turret camera offers long-term durability even among extreme weather conditions such as rain, snow, and ice and has a wide temperature range of -22 degrees to 140 degrees Fahrenheit.

**3D Digital Noise Reduction (DNR**) - effectively filters noise to produce a crisper, clear video stream.

**Key Features and Capabilities**

**Multi-megapixel resolution – Get more detail from your video camera.** This camera captures multi-megapixel resolution video footage that delivers crisp, clear detail and clarity for your video security needs.

Clearer, brighter images in low light and at night
Delivers a wider illumination spread
Reduces overexposure at the center of the image and eliminates hot spots
Eliminates blooming from lights by reducing ambient light pollution
Reduces video noise for a clearer nighttime picture and reduces bandwidth consumption and video storage requirements

**Innovative Day/Night Scene Detection** – includes a hardware sensor for intelligent software imaging that detects surveillance scene illumination. Designed to be water and dust-proof, this allows you to avoid unexpected costs of hardware failure

**HTML5 Plugin Free –** use on almost any Browser for support:

Plug-in required live view: IE9+, Chrome 41 and below, Firefox 52 and below
Plug-in free live view: Chrome 57.0+, Firefox 58.0+, Edge 16+, Safari 11+

**Ultra H.265 Compression – reduce bandwidth and storage requirements.** With Ultra H.265 compression technology, you can store more information using less hard drive space. Ultra H.265 also helps you minimize bandwidth requirements for high-resolution video and makes the remote viewing less demanding on the recorder.

**Intuitive interface – everything you need to manage your system at your fingertips.** System management has never been simpler with an intuitive interface and access to the free Vigilant Mobile App and Vigilant CMS.

**What’s Included:**

(1) Alibi Vigilant Flex Series 8MP turret security camera
(1) Mounting template
(1) Mounting hardware
(1) Quick start guide

**Protection and Warranty:**

Covered by Alibi''s 3-Year Warranty on the camera and recorder hardware and components, with unlimited US-based technical support. Questions before or after you buy? Call the shop and we will help you choose and set it up.','/img/alibi/ali-ft80-la-d-1.jpg',0,0,0,1,'Audio	Yes
Audio Compression	G.711U, G.711A
AGC Control	Yes
Lux (B/W)	0.0
Lux (Color)	0.005
Megapixel	8.0 (4K)
OSD	Yes
IR Wavelength (nm)	850
Illumination Distance (ft)	98
Digital Noise Reduction (DNR)	2D + 3D DNR
Dynamic Range (dB)	More than 52db
Electronic Shutter	1 ~ 1/100,000 sec
Flip	Yes
Imager Size (in)	1/2.7
Imager Type	CMOS
Wide Dynamic	D-WDR
Product Color	White/Black
Pan Angle	0° ~ 360°
Rotate Angle	0° ~ 360°
Outdoor	Yes
Operating Temperature (F)	-22° ~ 140°
Operating Humidity	0% ~ 95% (non-condensing)
Weight (lb)	0.7
Construction	Metal + Plastic
Certification	CE-EMC, FCC, CE LVD, UL/CUL, CE-RoHS
Dimensions	Ø4.6" x 3.9"
Ingress Protection	IP67
Focal Length (mm)	2.8
Relative Aperture (F-stop)	F1.6
Lens Type	Fixed
Lens Iris	fixed
FOV (Field of View)	100.8 Degrees
802.3	802.3af
Compatibility	Ai-RGUS (ONVIF), Avigilon (ONVIF), Digital Watchdog (ONVIF), Exacq Vision (ONVIF), Network Optix (ONVIF), Open Eye (ONVIF), Salient (ONVIF)
Ethernet	Yes
Power Supply Included	No
Power (w)	12V±25%, PoE (IEEE 802.3af), MAX: 5.4W
Privacy Video Block	Yes
Storage Capacity (GB)	Up to 512 (micro SD card not included)
Motion Detection	Yes
Compression Type	Ultra265, H.265, H.264, MJPEG
Mobile App	iOS & Android
Active Deterrent	No
NDAA Compliant	Yes
Reset Button	Yes
Brand	Alibi Vigilant
Warranty	3-Year
https://www.alibisecurity.com/media/docs/ali-ft80-la-d-datasheet-as.pdf
https://www.alibisecurity.com/blog/post/alibi-product-matrix
https://www.alibisecurity.com/blog/post/alibi-vigilant-mobile-app
https://www.alibisecurity.com/blog/post/power-distance
https://www.alibisecurity.com/media/docs/ali-vig-ipc-usermanual-br.pdf
https://www.alibisecurity.com/media/docs/ip-camera-installation-guide.pdf
https://www.alibisecurity.com/blog/post/alibi-vigilant-camera-firmware','Alibi ALI-FT80-LA-D 8MP 98 Feet Dual Light IR IP Turret Camera','Alibi ALI-FT80-LA-D 8MP 98 Feet Dual Light IR IP Turret Camera. NDAA compliant. Authorized Alibi dealer, ships from New York.','alibi, ali-ft80-la-d, ip camera, turret camera, ndaa','','ALI-FT80-LA-D','High quality image with 8MP, 1/2.7" CMOS sensor
8 MP (3840 × 2160)@20 fps; 5 MP (3072 × 1728)@30/25 fps; 4 MP (2560 × 1440)@30/25 fps; 1080P (1920 × 1080)@30/25 fps
Ultra 265, H.265, H.264, MJPEG
120dB true WDR technology enables clear image in strong light scene
Support Corridor Mode
Built-in Mic
Up to 30m (98ft) warm light distance
Supports 512 G Micro SD card
IP67 protection
Support PoE power supply
3-Axis','[{"label": "NDAA", "detail": "NDAA Compliant - meets the product technical requirements of NDAA Section 889", "icon": "/media/p_f8cbae82-4349-48a6-83af-8cebe63cdd9a.png"}, {"label": "Audio Mic", "detail": "Includes Built-in mic.", "icon": "/media/p_06f9cc60-9191-48c6-8bc9-95cf6fc8c7c1.png"}, {"label": "IP67", "detail": "IP67 Weather Rated Enclosure – Ideal for outdoor applications", "icon": "/media/p_1f4ccdb1-34be-4c19-9c10-39878257ce7d.png"}, {"label": "WDR", "detail": "Wide Dynamic Range – Gain better images in diverse lighting conditions", "icon": "/media/p_3b868fc0-904f-4642-bfcc-6944396dd866.png"}, {"label": "3D-DNR", "detail": "3D Digital Noise Reduction – Get exceptional video image quality with less noise", "icon": "/media/p_218ec18d-0a39-4fa6-8850-6f3f5af393ba.png"}, {"label": "ONVIF", "detail": "ONVIF Certified", "icon": "/media/p_e020abd0-1488-40b5-b565-6e2dc8f15bff.png"}]','',0);
INSERT OR IGNORE INTO products (slug,name,brand,brand_slug,category,price_cents,msrp_cents,cost_cents,blurb,image,featured,stock,stock_tracked,active,specs,meta_title,meta_description,meta_keywords,gtin,mpn,highlights,badges,options,addon) VALUES ('ali-pt81-vluai-d','Alibi ALI-PT81-VLUAI-D Vigilant  8MP Starlight 98 Feet IR IP Vandal Turret','ALIBI','alibi','security-ip-cameras',56999,59999,NULL,'**Alibi Vigilant  8MP Starlight 98 Feet IR IP Vandal Turret**
SKU ALI-PT81-VLUAI-D

**Multi-megapixel resolution – Get more detail from your video camera.** This camera captures multi-megapixel high-resolution video footage that delivers crisp, precise detail and clarity for your video security needs.

**SmartSense technology** – utilizes AI deep learning developed data algorithms to identify human and vehicular targets with extreme accuracy and reduce false alarms.

**IllumiNite Technology featuring Starlight+ chipsets –** features an HD progressive scan CMOS sensor, capturing clear and vivid color images day or night – even in extremely dark environments.

**IP67 weatherproof housing -** this turret camera delivers long-term durability even among extreme weather conditions such as rain, snow, and ice and has a wide temperature range of -40 degrees to 140 degrees Fahrenheit.

**Full Frame Illumination with Smart IR** Smart full-frame illumination technology offers several advantages over standard IR for flawless night vision, including:

Clearer, brighter images in low light and at night
Reduces overexposure of the IR LEDs at the center of the image
Increases illuminant efficiency up to 30%
Produces LED light in rectangle form to better fit screen size
Captures images up to 98 feet in the dark without washing out the subject at closer ranges
Reduces video noise for a clearer nighttime picture and reduces bandwidth consumption and video storage requirements

**HTML5 Plugin Free –** use on almost any Browser for support:

Plug-in required live view: IE9+, Chrome 41 and below, Firefox 52 and below
Plug-in free live view: Chrome 57.0+, Firefox 58.0+, Edge 16+, Safari 11+

**Ultra H.265 Compression – reduce bandwidth and storage requirements.** With Ultra H.265 compression technology, you can store more information using less hard drive space. Ultra H.265 also helps you minimize bandwidth requirements for high-resolution video and makes the remote viewing less demanding on the recorder.

**Intuitive interface – everything you need to manage your system at your fingertips.** With an intuitive interface and access to the free Vigilant Mobile App and Vigilant CMS, system management has never been simpler.

**What’s Included:**

(1) Alibi Vigilant Performance Series security camera
(1) Mounting template
(1) Mounting hardware
(1) Quick start guide

**Protection and Warranty:**

Covered by Alibi''s 3-Year Warranty on the camera and recorder hardware and components, with unlimited US-based technical support. Questions before or after you buy? Call the shop and we will help you choose and set it up.','/img/alibi/ali-pt81-vluai-d-1.jpg',0,0,0,1,'Audio	Yes
Audio Compression	G.711U, G.711A
Audio Streaming	Two-way
AGC Control	Yes
Lux (Color)	0.0003
Megapixel	8.0 (4K)
OSD	Yes
Illumination Distance (ft)	98
Digital Noise Reduction (DNR)	2D + 3D DNR
Dynamic Range (dB)	130
Electronic Shutter	1 ~ 1/100,000 sec
Flip	Yes
Imager Type	CMOS
Wide Dynamic	Yes
Product Color	White
Pan Angle	0° ~ 360°
Rotate Angle	0° ~ 360°
Outdoor	Yes
Operating Temperature (F)	-40° ~ 140°
Operating Humidity	0% ~ 95% (non-condensing)
Weight (lb)	1.54
Vandal-proof	IK10
Tilt Angle	0° ~ 75°
Construction	Metal
Certification	CE-EMC, CE-LVD, CE-RoHS, WEEE, FCC part 15
Dimensions	Ø5.1" x 4.3"
Ingress Protection	IP67
Focal Length (mm)	2.8
Lens Type	Fixed
Lens Iris	fixed
FOV (degrees)	105°
802.3	802.3af
Compatible Integrations	ONVIF (Profile S, Profile G, Profile T, Profile M), API, SDK
Ethernet Ports	1
Ethernet Interface	10/100 BASE-TX
Power Supply Included	No
Power (w)	12 Vdc ±25%, PoE (IEEE 802.3af)
Privacy Video Block	Yes
Storage Capacity (GB)	Up to 512 (micro SD card not included)
Motion Detection	Yes
Bit Rate	128 Kbps ~ 16 Mbps
Compression Type	Ultra265, H.265, H.264, MJPEG
Mobile App	iOS & Android
Starlight +	Yes
Active Deterrent	No
NDAA Compliant	Yes
Reset Button	Yes
Brand	Alibi Vigilant
Warranty	3-Year
https://www.alibisecurity.com/media/docs/ali-pt81-vluai-d-datasheet-as.pdf
https://www.alibisecurity.com/blog/post/alibi-product-matrix
https://www.alibisecurity.com/blog/post/alibi-vigilant-mobile-app
https://www.alibisecurity.com/blog/post/power-distance
https://www.alibisecurity.com/media/docs/ali-vig-ipc-usermanual-br.pdf
https://www.alibisecurity.com/media/docs/ip-camera-installation-guide.pdf
https://www.alibisecurity.com/blog/post/alibi-vigilant-camera-firmware','Alibi ALI-PT81-VLUAI-D 8MP Starlight 98 Feet IR IP Vandal Turret','Alibi ALI-PT81-VLUAI-D 8MP Starlight 98 Feet IR IP Vandal Turret. NDAA compliant. Authorized Alibi dealer, ships from New York.','alibi, ali-pt81-vluai-d, starlight, ip camera, turret camera, ndaa','','ALI-PT81-VLUAI-D','High quality image with 8 MP, 1/1.2" CMOS sensor
8 MP (3840 × 2160)@30/25 fps
Ultra 265, H.265, H.264, MJPEG
24-hour full-color images
Analytics, including line crossing, intrusion, enter area, leave area detection
Smart intrusion prevention with color retrieval reduces false alarm, focusing on human, motor vehicle and non-motor vehicle
Intelligent people flow counting and crowd density monitoring
ASM (auto scene match)
130 dB true WDR technology
Supports 9:16 corridor mode
Alarm I/O: 1/1, audio I/O: 1/1, built-in mic
White light, up to 30 m (98.4 ft)
MicroSD, up to 512 GB
IK10 vandal resistant and IP67 protection','[{"label": "NDAA", "detail": "NDAA Compliant - meets the product technical requirements of NDAA Section 889", "icon": "/media/p_f8cbae82-4349-48a6-83af-8cebe63cdd9a.png"}, {"label": "Starlight", "detail": "Starlight chipset with a super low light LUX rating", "icon": "/media/p_03ae7540-e2b2-4a7a-88cb-2d1ce56fae41.png"}, {"label": "Audio Mic", "detail": "Includes Built-in mic.", "icon": "/media/p_06f9cc60-9191-48c6-8bc9-95cf6fc8c7c1.png"}, {"label": "IP67", "detail": "IP67 Weather Rated Enclosure – Ideal for outdoor applications", "icon": "/media/p_1f4ccdb1-34be-4c19-9c10-39878257ce7d.png"}, {"label": "WDR", "detail": "Wide Dynamic Range – Gain better images in diverse lighting conditions", "icon": "/media/p_3b868fc0-904f-4642-bfcc-6944396dd866.png"}, {"label": "IK10", "detail": "IK10 rated vandalproof housing - resists impact effectively", "icon": "/media/p_34b15106-5e79-4128-8f1a-668de435eefb.png"}, {"label": "3D-DNR", "detail": "3D Digital Noise Reduction – Get exceptional video image quality with less noise", "icon": "/media/p_218ec18d-0a39-4fa6-8850-6f3f5af393ba.png"}, {"label": "ONVIF", "detail": "ONVIF Certified", "icon": "/media/p_e020abd0-1488-40b5-b565-6e2dc8f15bff.png"}]','',0);
INSERT OR IGNORE INTO products (slug,name,brand,brand_slug,category,price_cents,msrp_cents,cost_cents,blurb,image,featured,stock,stock_tracked,active,specs,meta_title,meta_description,meta_keywords,gtin,mpn,highlights,badges,options,addon) VALUES ('ali-nr043f-1-d','Alibi ALI-NR043F-1-D Vigilant Flex Series 4 - Channel Network Video Recorder','ALIBI','alibi','nvr-4-channels',33199,34999,NULL,'**Alibi Vigilant Flex Series 4 - Channel Network Video Recorder**
SKU ALI-NR043F-1-D

The Alibi Vigilant Flex Series 4-Channel NVR supports up to 4 IP cameras, one hard drive bay up to 24TB. With a recording resolution of up to 8.0 MP, it delivers ultra-sharp, high-resolution images and supports incoming bandwidth at 80 Mbps and outgoing at 64 Mbps.

**NDAA Compliant** Built with Rockchip chipset which meets federal government compliance requirements

**Ultra compression technology** - This NVR supports Ultra H.265, H.265, and H.264 video codecs that help reduce file size, maximize recording time and save hard drive space.

**Easy plug-and-play** – integrated 4-port PoE switch supports 802.3af/at, reducing the need for additional network switches. This NVR offers plug-and-play auto-connect features for compatible Alibi cameras. Install your cameras where you need them most without the need for a nearby power outlet.

**Smart VCA detection** - this versatile recorder allows multiple selectable recording modes: intrusion, cross line, defocus and scene change detection, and VCA search. Recording features include event search, event log, and email notification.

**Intuitive interface** – everything you need to manage your system at your fingertips. With an intuitive interface and access with Alibi Security, managing your network has never been simpler. It’s loaded with powerful features: drag-and-drop system and camera selection, customizable displays, device grouping, alarms and notifications, and remote system management.

**Smart Analytics Supported:**

Motor Vehicle Search
Non-Motor Vehicle Search
Human Body Search
General Search
People Counting Report
Heat Map
Defocus Detection
Scene Change Detection
Object Left Behind
Object Removed
Auto Tracking
Motion Detection
Tampering
Human Body Detection
Video Loss
Alarm Input
Audio Detection

**Hard drives not included.** We recommend security-grade hard drives made for surveillance, which we can supply and install for you. Customer-installed components (including hard drives) may damage the recorder and result in non-warranty repair costs.

**Protection and Warranty:**

Covered by Alibi''s 3-Year Warranty on the camera and recorder hardware and components, with unlimited US-based technical support. Questions before or after you buy? Call the shop and we will help you choose and set it up.','/img/alibi/ali-nr043f-1-d-1.jpg',0,0,0,1,'Audio	Yes (Camera Dependent)
Audio Streaming	Two-way
outputs	(1) RCA audio, (1) VGA, (1) HDMI, (1) USB 2.0, (1) USB 3.0
Inputs	(1) RCA audio
Product Color	Black
Operating Temperature (F)	+ 14°F~ + 131°F )
Operating Humidity	0% ~ 90%
Hard Drive Bays	1
Weight (lb)	2.2
Certification	CE, FCC Part15, UL, RoHS, WEEE, EN,
Dimensions	260 mm × 222 mm × 47 mm (1 0.2 " × 8.7 " × 1.8 ")
DVD Burner	No
Hard Drive Type	SATA
Hard Drive Included	No
Remote Viewable	Yes
Remote Configuration	Yes
Compatibility	Ai-RGUS (ONVIF), Avigilon (ONVIF), Digital Watchdog (ONVIF), Exacq Vision (ONVIF), Network Optix (ONVIF), Open Eye (ONVIF), Salient (ONVIF)
Ethernet Speed	10M / 100M self-adaptive
Ethernet Ports	1
Ethernet Interface	RJ-45
Power Supply Included	Yes
Power (w)	48 Vdc Power Consumption: ?9 W (without HDD)
PoE	(802.3af / 802.3at)
Recording Resolution	Up to 16 Megapixel
Smart Search	Yes
Video Analytics Capable	Yes
Bit Rate	80 Mbps incoming, 64 Mbps outgoing
Channels	4
Compression Type	Ultra265, H.265, H.264
Email Notification	Yes
Event Log	Yes
Event Notification	Yes
Max Storage (TB)	Supports up to 16TB (1 x 16TB HDD)
Active Deterrent	No
NDAA Compliant	Yes
Brand	Alibi Vigilant
Warranty	3-Year
https://www.alibisecurity.com/media/docs/ali-nr043f-1-d-datasheet-b-as.pdf
https://www.alibisecurity.com/media/docs/POS-Operation-Guide-ALIBI-Vigilant-2026.pdf
https://www.alibisecurity.com/blog/post/vigilant-nvr-compatible-hdd
https://www.alibisecurity.com/blog/post/alibi-product-matrix
https://www.alibisecurity.com/blog/post/alibi-vigilant-software
https://www.alibisecurity.com/blog/post/alibi-vigilant-mobile-app
https://www.alibisecurity.com/blog/post/alibi-vigilant-software/
https://www.alibisecurity.com/blog/post/alibi-vigilant-recorder-firmware','Alibi ALI-NR043F-1-D 4 - Channel Network Video Recorder','Alibi ALI-NR043F-1-D 4 - Channel Network Video Recorder. NDAA compliant. Authorized Alibi dealer, ships from New York.','alibi, ali-nr043f-1-d, nvr, ndaa','','ALI-NR043F-1-D','4-channel input
Up to 16 MP resolution recording
Bandwidth – Incoming 80Mbps / Outgoing 64Mbps
NDAA Compliant
Ultra 265/H.265 video compression formats to maximize video storage
ANR technology resyncs video when the network is disconnected
Plug & play with four (4) independent PoE network interfaces
Supports HDMI and VGA simultaneous output
Audio I/O 1 in 1 out; Alarm 1 in/1 out
1 SATA HDD bay - up to 24TB support
ONVIF (Profile S, Profile G, Profile T) + RTSP protocols
Cloud firmware updating','[{"label": "NDAA", "detail": "NDAA Compliant - meets the product technical requirements of NDAA Section 889", "icon": "/media/p_f8cbae82-4349-48a6-83af-8cebe63cdd9a.png"}, {"label": "ONVIF", "detail": "ONVIF Certified", "icon": "/media/p_e020abd0-1488-40b5-b565-6e2dc8f15bff.png"}, {"label": "4-Channel", "detail": "4 recording channels", "icon": "/media/p_1f98e90a-b80f-4aad-8462-990143f847a7.png"}]','',0);
INSERT OR IGNORE INTO products (slug,name,brand,brand_slug,category,price_cents,msrp_cents,cost_cents,blurb,image,featured,stock,stock_tracked,active,specs,meta_title,meta_description,meta_keywords,gtin,mpn,highlights,badges,options,addon) VALUES ('ali-nr160pai-2-d','Alibi ALI-NR160PAI-2-D ALIBI VIGILANT PERFORMANCE SERIES 16-Channel Ultra H.265 NVR','ALIBI','alibi','nvr-16-channels',94999,99999,NULL,'**ALIBI VIGILANT PERFORMANCE SERIES 16-Channel Ultra H.265 NVR**
SKU ALI-NR160PAI-2-D

The Alibi Vigilant Performance Series 16-Channel NVR supports up to 16IP cameras, two hard drive bay up to 16TB, and an incoming bandwidth of 320 Mbps. With a recording resolution of up to 16 MP, it delivers ultra-sharp, high-resolution images.

Video Targeted Search

**IN ONE CLICK,** find the one you want. Simply frame the target on the live or playback interface, click "search," and within seconds, obtain results. This process, which used to take hours with traditional methods, is now reduced to mere seconds.

**IN SECONDS,** Leveraging the computational power, accurately extract target attribute information in complex environments, and comparing it with the massive data from all-channel footage. This minimizes the risk of errors and greatly saving time in identifying suspects.

**Ultra compression technology** - This NVR supports Ultra H.265, H.265, and H.264 video codecs that help reduce file size, maximize recording time and save hard drive space.

**Easy plug-and-play** – Integrated 16-port PoE switch, reducing the need for additional network switches. This NVR offers plug-and-play auto-connect features for compatible Alibi cameras. Install your cameras where you need them most without the need for a nearby power outlet.

**Smart VCA detection** - This versatile recorder allows multiple selectable recording modes: motorized vehicle, non-motorized vehicle, human body, general search, people count report, heat map.

**Supports IPC VCA** - face detection, face recognition, vehicle detection, SIP (Smart Intrusion Prevention), UMD (Ultra Motion Detection), temperature detection, people counting, video with metadata, traffic monitoring on 16 channels.

**Intuitive interface** – Everything you need to manage your system at your fingertips. With an intuitive interface and access to the free Alibi Vigilant Mobile App and Alibi Vigilant CMS, managing your network has never been simpler. It’s loaded with powerful features: drag-and-drop system and camera selection, customizable displays, device grouping, alarms and notifications, and remote system management.

**Hard drives not included.** We recommend security-grade hard drives made for surveillance, which we can supply and install for you. Customer-installed components (including hard drives) may damage the recorder and result in non-warranty repair costs.

**Protection and Warranty:**

Covered by Alibi''s 3-Year Warranty on the camera and recorder hardware and components, with unlimited US-based technical support. Questions before or after you buy? Call the shop and we will help you choose and set it up.','/img/alibi/ali-nr160pai-2-d-1.jpg',0,0,0,1,'Audio	Yes (Camera Dependent)
Audio Compression	G.711U, G.711A
Audio Streaming	Two-way
Alarm Output	Yes
outputs	HDMI, VGA, RCA audio, (2) USB 2.0, (1) USB 3.0
Alarm Outputs	2
Audio In	1
Audio Out	1
Product Color	Black
Hard Drive Bays	2
Weight (lb)	6.0
Chassis	1U Rackmount
Dimensions	380mm × 322mm × 53mm (15.0"×12.7"×2.1")
DVD Burner	No
Hard Drive Type	SATA
Hard Drive Included	No
Remote Viewable	Yes
Remote Configuration	Yes
Ethernet Ports	16
Power Supply Included	Yes
Power (w)	100 ~ 240 V
Recording Resolution	Up to 16 Megapixel
Selectable Frame Rate	Yes
Video Analytics Capable	Yes
Bit Rate	320 Mbps incoming, 160 Mbps outgoing
Channels	16
Compression Type	Ultra265, H.265, H.264
Max Storage (TB)	Supports up to 32TB (2 x 16TB HDD)
Active Deterrent	No
NDAA Compliant	Yes
Brand	Alibi Vigilant
Warranty	3-Year
https://www.alibisecurity.com/media/docs/ali-nr160pai-2-d-datasheet-as.pdf
https://www.alibisecurity.com/blog/post/vigilant-nvr-compatible-hdd
https://www.alibisecurity.com/blog/post/alibi-product-matrix
https://www.alibisecurity.com/blog/post/alibi-vigilant-software
https://www.alibisecurity.com/blog/post/alibi-vigilant-mobile-app
https://www.alibisecurity.com/blog/post/alibi-vigilant-software/
https://www.alibisecurity.com/blog/post/alibi-vigilant-recorder-firmware','Alibi ALI-NR160PAI-2-D 16-Channel Ultra H.265 NVR','Alibi ALI-NR160PAI-2-D 16-Channel Ultra H.265 NVR. NDAA compliant. Authorized Alibi dealer, ships from New York.','alibi, ali-nr160pai-2-d, nvr, ndaa','','ALI-NR160PAI-2-D','Video Targeted Search - Simply frame the target in the video, click "search" and within seconds, obtain results.
Support Ultra 265/H.265/H.264 video formats
16 ‑channel input
Plug & Play with 16 independent PoE network interfaces
Support mainstream cameras of ONVIF conformance (Profile S, Profile G, Profile T ) and RTSP protocols
Support 1-ch HDMI, 1-ch VGA. HDMI up to 4K (3840x2160) resolution
VGA and HDMI independent output
Up to 32 Megapixels resolution recording
ANR technology to enhance the storage reliability when the network is disconnected
Support cloud upgrade','[{"label": "NDAA", "detail": "NDAA Compliant - meets the product technical requirements of NDAA Section 889", "icon": "/media/p_f8cbae82-4349-48a6-83af-8cebe63cdd9a.png"}, {"label": "16-Channel", "detail": "16 recording channels", "icon": ""}]','',0);
INSERT OR IGNORE INTO products (slug,name,brand,brand_slug,category,price_cents,msrp_cents,cost_cents,blurb,image,featured,stock,stock_tracked,active,specs,meta_title,meta_description,meta_keywords,gtin,mpn,highlights,badges,options,addon) VALUES ('ali-pb50-luais-d','Alibi ALI-PB50-LUAIS-D Vigilant 5MP 131 Feet IllumiNite-IR Starlight IntelliSearch IP Bullet Camera w/Built-in Mic and Speaker','ALIBI','alibi','security-ip-cameras',41799,43999,NULL,'**Alibi Vigilant 5MP 131 Feet IllumiNite-IR Starlight IntelliSearch IP Bullet Camera w/Built-in Mic and Speaker**
SKU ALI-PB50-LUAIS-D

The Alibi Vigilant Performance Series, 5MP Starlight Bullet Security Camera delivers crisp video day or night.

Integrates SmartSense, IllumiNite and Active Deterrence into one IP camera. It can not only alert when events happen, but also get color information in low-light environment. Red and blue light is more noticeable than white light, especially in low visibility weather such as rain and fog.

**IntelliSearch Color Match Technology -** Powerful camera analytics capture apparel colors and vehicle color and apply metadata to the video recording. Using powerful search algorithms, users can apply filters to quickly search for upper or lower garment color or vehicle exterior color significantly reducing the amount of time needed to search video footage.

**Color Attribute Collection –** Advanced technology collects the color information of the target with high accuracy for identification of a human’s upper and lower garment, color of a vehicle, and upper garment color of the driver of a non-motor vehicle.

**Auto Scene Adjustment (intelligent WDR) –** Allows camera to easily and quickly improve image quality in high-contrast lighting conditions (foggy, backlit, flickering) and capture details in both areas of the video that are dimly and brightly lit.

**SmartSense Technology** – Utilizes AI deep learning developed data algorithms to identify human and vehicular targets with extreme accuracy and reduce false alarms.

**Capture Color Video at Night –** Starlight technology chipset uses ambient light sources to capture color video in extreme low light conditions. In the darkness, you can rely on the camera’s full-frame illumination technology to see clear, sharp images up to 131 feet in the dark.

**Superior Outdoor Performance** – With an IP67 weather-rated metal enclosure, this bullet camera offers long-term durability even among extreme weather conditions such as rain, snow, and ice and has a wide temperature range of -22 degrees to 140 degrees Fahrenheit.

**3D Digital Noise Reduction (DNR**) - effectively filters noise to produce a crisper, clear video stream.

**Smart Analytics Supports:**

Motion detection
Ultra Motion Detection
Tampering alarm
Audio detection
Cross line detection
Intrusion detection
Enter area detection
Leave area detection
Face Detection
Crowd density monitoring
People flow counting

**Key Features and Capabilities**

**Multi-megapixel resolution – Get more detail from your video camera.** This camera captures multi-megapixel resolution video footage that delivers crisp, clear detail and clarity for your video security needs.

**Starlight Technology** – featuring an HD progressive scan CMOS sensor, this next-generation Starlight chipset can capture clear and vivid color images day or night – even in extremely dark environments.

**Full Frame IllumiNite technology with Smart IR -**Smart full-frame illumination technology offers several advantages over standard IR for flawless night vision, including:

Clearer, brighter images in low light and at night
Delivers a wider illumination spread
Unique rectangular IR LED design produces a uniformly illuminated image across the entire screen
Reduces overexposure at the center of the image and eliminates hot spots
Eliminates blooming from lights by reducing ambient light pollution
Reduces video noise for a clearer nighttime picture and reduces bandwidth consumption and video storage requirements

**Innovative Day/Night Scene Detection** – includes a hardware sensor for intelligent software imaging that detects surveillance scene illumination. Designed to be water and dust-proof, this allows you to avoid unexpected costs of hardware failure

**HTML5 Plugin Free –** use on almost any Browser for support:

Plug-in required live view: IE9+, Chrome 41 and below, Firefox 52 and below
Plug-in free live view: Chrome 57.0+, Firefox 58.0+, Edge 16+, Safari 11+

**Ultra H.265 Compression – reduce bandwidth and storage requirements.** With Ultra H.265 compression technology, you can store more information using less hard drive space. Ultra H.265 also helps you minimize bandwidth requirements for high-resolution video and makes the remote viewing less demanding on the recorder.

**Intuitive interface – everything you need to manage your system at your fingertips.** System management has never been simpler with an intuitive interface and access to the free Vigilant Mobile App and Vigilant CMS.

**What’s Included:**

(1) Alibi Vigilant Performance Series 5MP bullet security camera
(1) Mounting template
(1) Mounting hardware
(1) Quick start guide

**Protection and Warranty:**

Covered by Alibi''s 3-Year Warranty on the camera and recorder hardware and components, with unlimited US-based technical support. Questions before or after you buy? Call the shop and we will help you choose and set it up.','/img/alibi/ali-pb50-luais-d-1.jpg',0,0,0,1,'Audio	Yes
Audio Compression	G.711U, G.711A
Sensor Inputs	1
connectors	1 RJ45 10M/100M Base - TX Ethernet
Lux (B/W)	0.0 (IR ON)
Lux (Color)	0.01
Megapixel	5.0
IR Wavelength (nm)	850
Illumination Distance (ft)	130
Dynamic Range (dB)	120
Electronic Shutter	1 ~ 1/100,000 sec
Imager Size (in)	1/2.8
Wide Dynamic	Yes
Operating Temperature (F)	-40° ~ 140°
Operating Humidity	0% ~ 95% (non-condensing)
Weight (lb)	2.1
Construction	Metal + Plastic
Certification	CE, UL, FCC part 15, CE-RoHS
Dimensions	269 × 96 × 82mm (10.6” × 3.8” × 3.2”)
Ingress Protection	IP67
Heater	Yes
Focal Length (mm)	2.8
Relative Aperture (F-stop)	F1
Lens Iris	fixed
FOV (Field of View)	109
802.3	802.3af
Compatibility	Ai-RGUS (ONVIF), Avigilon (ONVIF), Digital Watchdog (ONVIF), Exacq Vision (ONVIF), Network Optix (ONVIF), Open Eye (ONVIF), Salient (ONVIF)
Compatible Integrations	ONVIF (Profile S, Profile G, Profile T), API, SDK
Power (w)	DC12V(±25%), PoE(IEEE 802.3af); Max 10W
Storage Capacity (GB)	Up to 256 (micro SD card not included)
Bit Rate	128 Kbps ~ 16 Mbps
Active Deterrent	Yes
NDAA Compliant	Yes
Reset Button	Yes
Brand	Alibi Vigilant
Warranty	3-Year
https://www.alibisecurity.com/media/docs/ali-pb50-luais-d-datasheet-as.pdf
https://www.alibisecurity.com/blog/post/alibi-product-matrix
https://www.alibisecurity.com/blog/post/alibi-vigilant-mobile-app
https://www.alibisecurity.com/blog/post/power-distance
https://www.alibisecurity.com/media/docs/ali-vig-ipc-usermanual-br.pdf
https://www.alibisecurity.com/media/docs/ip-camera-installation-guide.pdf
https://www.alibisecurity.com/blog/post/alibi-vigilant-camera-firmware','Alibi ALI-PB50-LUAIS-D 5MP 131 Feet IllumiNite-IR Starlight IntelliSearch','Alibi ALI-PB50-LUAIS-D 5MP 131 Feet IllumiNite-IR Starlight IntelliSearch. NDAA compliant. Authorized Alibi dealer, ships from New York.','alibi, ali-pb50-luais-d, starlight, ip camera, bullet camera, ndaa','','ALI-PB50-LUAIS-D','5MP high-resolution 2880 x 1620 @ 30fps
2.8mm @ F1.0
109 degrees horizontal FOV to capture large areas
Smart IR up to 131 feet nighttime viewing
Color Attribute Collection
IntelliSearch Color Match Technology
Starlight technology - Color: 0.001Lux, 0 Lux with IR
130dB True Wide Dynamic Range (WDR)
Built-in mic and speaker
Audio I/O 1 in 1 out; Alarm 1 in/1 out
Micro SD, up to 512 GB
Supports Ultra 265, H.265, H.264, and MJPEG
ANR, NAS(NFS) Network Storage
Supports ONVIF (Profile S, Profile G, Profile T), API, SDK
IP67 weather-resistant rating
NDAA Compliant
One-click Cloud firmware updating
Motion detection
Ultra Motion Detection
Tampering alarm
Audio detection
Cross line detection
Intrusion detection
Enter area detection
Leave area detection
Face Detection
Crowd density monitoring
People flow counting','[{"label": "NDAA", "detail": "NDAA Compliant - meets the product technical requirements of NDAA Section 889", "icon": "/media/p_f8cbae82-4349-48a6-83af-8cebe63cdd9a.png"}, {"label": "Starlight", "detail": "Starlight chipset with a super low light LUX rating", "icon": "/media/p_03ae7540-e2b2-4a7a-88cb-2d1ce56fae41.png"}, {"label": "Audio Mic", "detail": "Includes Built-in mic.", "icon": "/media/p_06f9cc60-9191-48c6-8bc9-95cf6fc8c7c1.png"}, {"label": "IP67", "detail": "IP67 Weather Rated Enclosure – Ideal for outdoor applications", "icon": "/media/p_1f4ccdb1-34be-4c19-9c10-39878257ce7d.png"}, {"label": "WDR", "detail": "Wide Dynamic Range – Gain better images in diverse lighting conditions", "icon": "/media/p_3b868fc0-904f-4642-bfcc-6944396dd866.png"}, {"label": "ONVIF", "detail": "ONVIF Certified", "icon": "/media/p_e020abd0-1488-40b5-b565-6e2dc8f15bff.png"}, {"label": "1-Click", "detail": "One-click Cloud firmware updating.", "icon": "/media/p_29411a7b-1eaa-476f-bb42-bc698fd2be7e.png"}]','',0);
INSERT OR IGNORE INTO products (slug,name,brand,brand_slug,category,price_cents,msrp_cents,cost_cents,blurb,image,featured,stock,stock_tracked,active,specs,meta_title,meta_description,meta_keywords,gtin,mpn,highlights,badges,options,addon) VALUES ('ali-pb80-vluais-d','Alibi ALI-PB80-VLUAIS-D Vigilant 8MP 131 Feet IllumiNite-IR Starlight+ IntelliSearch Vandal IP Bullet Camera w/Built-in Mic and Speaker','ALIBI','alibi','security-ip-cameras',53199,55999,NULL,'**Alibi Vigilant 8MP 131 Feet IllumiNite-IR Starlight+ IntelliSearch Vandal IP Bullet Camera w/Built-in Mic and Speaker**
SKU ALI-PB80-VLUAIS-D

The Alibi Vigilant Performance Series, 8MP Starlight+ Bullet Security Camera delivers crisp video day or night.

**IntelliSearch Color Match Technology -** Powerful camera analytics capture apparel colors and vehicle color and apply metadata to the video recording. Using powerful search algorithms, users can apply filters to quickly search for upper or lower garment color or vehicle exterior color significantly reducing the amount of time needed to search video footage.

**Color Attribute Collection –** Advanced technology collects the color information of the target with high accuracy for identification of a human’s upper and lower garment, color of a vehicle, and upper garment color of the driver of a non-motor vehicle.

**Auto Scene Adjustment (intelligent WDR) –** Allows camera to easily and quickly improve image quality in high-contrast lighting conditions (foggy, backlit, flickering) and capture details in both areas of the video that are dimly and brightly lit.

**SmartSense Technology** – Utilizes AI deep learning developed data algorithms to identify human and vehicular targets with extreme accuracy and reduce false alarms.

**Capture Color Video at Night –** Starlight technology chipset uses ambient light sources to capture color video in extreme low light conditions. In the darkness, you can rely on the camera’s full-frame illumination technology to see clear, sharp images up to 131 feet in the dark.

**Superior Outdoor Performance** – With an IP67 weather-rated metal enclosure, this bullet camera offers long-term durability even among extreme weather conditions such as rain, snow, and ice and has a wide temperature range of -22 degrees to 140 degrees Fahrenheit.

**3D Digital Noise Reduction (DNR)** - effectively filters noise to produce a crisper, clear video stream.

**Key Features and Capabilities**

**Multi-megapixel resolution – Get more detail from your video camera.** This camera captures multi-megapixel resolution video footage that delivers crisp, clear detail and clarity for your video security needs.

**Starlight+ Technology** – featuring an HD progressive scan CMOS sensor, this next-generation Starlight chipset can capture clear and vivid color images day or night – even in extremely dark environments.

**Full Frame IllumiNite technology with Smart IR -**Smart full-frame illumination technology offers several advantages over standard IR for flawless night vision, including:

Clearer, brighter images in low light and at night
Delivers a wider illumination spread
Unique rectangular IR LED design produces a uniformly illuminated image across the entire screen
Reduces overexposure at the center of the image and eliminates hot spots
Eliminates blooming from lights by reducing ambient light pollution
Reduces video noise for a clearer nighttime picture and reduces bandwidth consumption and video storage requirements

**Innovative Day/Night Scene Detection** – includes a hardware sensor for intelligent software imaging that detects surveillance scene illumination. Designed to be water and dust-proof, this allows you to avoid unexpected costs of hardware failure

**HTML5 Plugin Free –** use on almost any Browser for support:

Plug-in required live view: IE9+, Chrome 41 and below, Firefox 52 and below
Plug-in free live view: Chrome 57.0+, Firefox 58.0+, Edge 16+, Safari 11+

**Ultra H.265 Compression – reduce bandwidth and storage requirements.** With Ultra H.265 compression technology, you can store more information using less hard drive space. Ultra H.265 also helps you minimize bandwidth requirements for high-resolution video and makes the remote viewing less demanding on the recorder.

**Intuitive interface – everything you need to manage your system at your fingertips.** System management has never been simpler with an intuitive interface and access to the free Vigilant Mobile App and Vigilant CMS.

**What’s Included:**

(1) Alibi Vigilant Performance Series 8MP Starlight+ bullet security camera
(1) Mounting template
(1) Mounting hardware
(1) Quick start guide

Smart Analytics Supports:

Color Search
Motion Detection
Ultra Motion Detection
Line Crossing Detection
Intrusion Detection
Enter/Exit Alert
Human Detection
Motor Vehicle Detection
Non-Motor Vehicle Detection
Face Detection
People Flow Counting
Crowd Density Monitoring
Audio Detection
Tampering Alarm
Object Left Behind
Object Removed

**Protection and Warranty:**

Covered by Alibi''s 3-Year Warranty on the camera and recorder hardware and components, with unlimited US-based technical support. Questions before or after you buy? Call the shop and we will help you choose and set it up.','/img/alibi/ali-pb80-vluais-d-1.jpg',0,0,0,1,'Audio	Yes
Audio Compression	G.711U, G.711A
Audio Streaming	Two-way
Sensor Inputs	1
connectors	1 RJ45 10M/100M Base - TX Ethernet
Lux (B/W)	0.0 (IR ON)
Lux (Color)	0.0005 (0.0 with light)
Megapixel	8.0 (4K)
IR Wavelength (nm)	850
Illumination Distance (ft)	131
Dynamic Range (dB)	130
Electronic Shutter	1 ~ 1/100,000 sec
Imager Size (in)	1/1.8
Imager Type	CMOS
Wide Dynamic	Yes
Pan Angle	0° ~ 360°
Rotate Angle	0° ~ 360°
Operating Temperature (F)	-40° ~ 140°
Operating Humidity	0% ~ 95% (non-condensing)
Weight (lb)	2.1
Vandal-proof	IK10
Construction	Metal + Plastic
Certification	CE, UL, FCC part 15, CE-RoHS
Dimensions	265.2 mm × 95.2 mm × 82.9 mm (10.4" × 3.7" × 3.3" ) (L × W × H)
Ingress Protection	IP67
Heater	Yes
Focal Length (mm)	2.8
Relative Aperture (F-stop)	F1
Lens Type	Fixed
Lens Iris	fixed
FOV (Field of View)	108.1
802.3	802.3af
Compatibility	Ai-RGUS (ONVIF), Avigilon (ONVIF), Digital Watchdog (ONVIF), Exacq Vision (ONVIF), Network Optix (ONVIF), Open Eye (ONVIF), Salient (ONVIF)
Compatible Integrations	ONVIF (Profile S, Profile G, Profile T, Profile M), API, SDK
Power (w)	DC12V(±25%), PoE(IEEE 802.3af); Max 6.2W
Storage Capacity (GB)	Up to 256 (micro SD card not included)
Bit Rate	128 Kbps ~ 16 Mbps
Starlight +	Yes
Active Deterrent	Yes
NDAA Compliant	Yes
Reset Button	Yes
Brand	Alibi Vigilant
Warranty	3-Year
https://www.alibisecurity.com/media/docs/ali-pb80-vluais-d-datasheet-as.pdf
https://www.alibisecurity.com/blog/post/alibi-product-matrix
https://www.alibisecurity.com/blog/post/alibi-vigilant-mobile-app
https://www.alibisecurity.com/blog/post/power-distance
https://www.alibisecurity.com/media/docs/ali-vig-ipc-usermanual-br.pdf
https://www.alibisecurity.com/media/docs/ip-camera-installation-guide.pdf
https://www.alibisecurity.com/blog/post/alibi-vigilant-camera-firmware','Alibi ALI-PB80-VLUAIS-D 8MP 131 Feet IllumiNite-IR Starlight+','Alibi ALI-PB80-VLUAIS-D 8MP 131 Feet IllumiNite-IR Starlight+. NDAA compliant. Authorized Alibi dealer, ships from New York.','alibi, ali-pb80-vluais-d, starlight, ip camera, bullet camera, ndaa','','ALI-PB80-VLUAIS-D','8MP high-resolution 3840 x 2160 @ 30fps
2.8mm @ F1.0
108.1 degrees horizontal FOV to capture large areas
Smart IR up to 131 feet nighttime viewing
Color Attribute Collection
IntelliSearch Color Match Technology
Starlight+ technology - Color: 0.0005 Lux, 0 Lux with IR
130dB True Wide Dynamic Range (WDR)
Supports red & blue warning lights for Active Deterrence
Built-in mic and speaker
Audio I/O 1 in 1 out; Alarm 1 in/1 out
Micro SD, up to 512 GB
Supports Ultra 265, H.265, H.264, and MJPEG
ANR, NAS(NFS) Network Storage
IP67 weather-resistant rating
IK10 vandal resistant
NDAA Compliant
One-click Cloud firmware updating','[{"label": "NDAA", "detail": "NDAA Compliant - meets the product technical requirements of NDAA Section 889", "icon": "/media/p_f8cbae82-4349-48a6-83af-8cebe63cdd9a.png"}, {"label": "Starlight", "detail": "Starlight chipset with a super low light LUX rating", "icon": "/media/p_03ae7540-e2b2-4a7a-88cb-2d1ce56fae41.png"}, {"label": "Audio Mic", "detail": "Includes Built-in mic.", "icon": "/media/p_06f9cc60-9191-48c6-8bc9-95cf6fc8c7c1.png"}, {"label": "IP67", "detail": "IP67 Weather Rated Enclosure – Ideal for outdoor applications", "icon": "/media/p_1f4ccdb1-34be-4c19-9c10-39878257ce7d.png"}, {"label": "WDR", "detail": "Wide Dynamic Range – Gain better images in diverse lighting conditions", "icon": "/media/p_3b868fc0-904f-4642-bfcc-6944396dd866.png"}, {"label": "IK10", "detail": "IK10 rated vandalproof housing - resists impact effectively", "icon": "/media/p_34b15106-5e79-4128-8f1a-668de435eefb.png"}, {"label": "ONVIF", "detail": "ONVIF Certified", "icon": "/media/p_e020abd0-1488-40b5-b565-6e2dc8f15bff.png"}, {"label": "1-Click", "detail": "One-click Cloud firmware updating.", "icon": "/media/p_29411a7b-1eaa-476f-bb42-bc698fd2be7e.png"}]','',0);
INSERT OR IGNORE INTO products (slug,name,brand,brand_slug,category,price_cents,msrp_cents,cost_cents,blurb,image,featured,stock,stock_tracked,active,specs,meta_title,meta_description,meta_keywords,gtin,mpn,highlights,badges,options,addon) VALUES ('ali-pm80-vluai-d','Alibi ALI-PM80-VLUAI-D Vigilant Performance Series Starlight+ 8MP IP Fixed Vandal-Resistant Wedge Dome Camera','ALIBI','alibi','security-ip-cameras',43699,45999,NULL,'**Alibi Vigilant Performance Series Starlight+ 8MP IP Fixed Vandal-Resistant Wedge Dome Camera**
SKU ALI-PM80-VLUAI-D

As part of the Alibi Vigilant Performance Series, this dual light IP fixed wedge dome camera delivers crisp video day or night and has been designed and manufactured to comply with the latest technical requirements specified under NDAA regulations.

**Multi-Megapixel Resolution Video –** 8MP resolution allows you to capture a high level of clarity and detail for most applications.

**2D/3D Digital Noise Reduction (DNR**) effectively filters noise to produce a crisper, clear video stream.

**SmartSense technology** – utilizes AI deep learning developed data algorithms to identify human and vehicular targets with extreme accuracy and reduce false alarms.

**Ultra H.265 Compression – reduce bandwidth and storage requirements.** With Ultra H.265 compression technology, you can store more information using less hard drive space. Ultra H.265 also helps you minimize bandwidth requirements for high-resolution video and makes the remote viewing less demanding on the recorder.

**IP67 weatherproof housing** –this camera can handle long-term durability even among extreme weather conditions such as rain, snow, and ice.

**Intuitive interface – everything you need to manage your system at your fingertips.** With an intuitive interface and access to the free Alibi CMS and mobile app, system management has never been simpler.

**What’s Included:**

(1) 8MP Fixed Wedge Dome IP security camera
(1) Mounting template
(1) Mounting hardware
(1) Quick start guide

**Protection and Warranty:**

Covered by Alibi''s 3-Year Warranty on the camera and recorder hardware and components, with unlimited US-based technical support. Questions before or after you buy? Call the shop and we will help you choose and set it up.','/img/alibi/ali-pm80-vluai-d-1.jpg',0,0,0,1,'Audio	Yes
Audio Compression	G.711U, G.711A
Audio Streaming	Two-way
Audio In	1
Audio Out	1
AGC Control	Yes
Lux (B/W)	0.0 (IR ON)
Lux (Color)	0.002
Megapixel	8.0 (4K)
OSD	Yes
IR Wavelength (nm)	850
Illumination Distance (ft)	98
Day/Night Function	ICR (Auto/Day/Night)
Digital Noise Reduction (DNR)	2D + 3D DNR
Dynamic Range (dB)	130
Electronic Shutter	1 ~ 1/100,000 sec
Flip	Yes
Imager Size (in)	1/2.7
Imager Type	CMOS
Wide Dynamic	Yes
Product Color	White
Pan Angle	-48° to 48°
Rotate Angle	0° to 360°
Outdoor	Yes
Operating Temperature (F)	-22° ~ 140°
Operating Humidity	0% ~ 95% (non-condensing)
Weight (lb)	1.1
Vandal-proof	IK10
Construction	Metal
Certification	UL, CE-EMC, CE-LVD, CE-RoHS, FCC (FCC 47 CFR part15 B)
Card Reader Type	Micro SD
Dimensions	Ø111.2 mm × 72.6 mm (Ø4.4" × 2.9") (Ø × H)
Ingress Protection	IP67
Focal Length (mm)	2.8
Relative Aperture (F-stop)	F1.6
Lens Type	Fixed
FOV (Field of View)	104°
802.3	802.3af
Compatible Integrations	ONVIF (Profile S, Profile G, Profile T, Profile M), API, SDK
Power Supply Included	No
Power (w)	12 Vdc ±25%, PoE (IEEE 802.3af), Max: 8.5 W; Ø5.5 mm coaxial power plug
Privacy Video Block	Yes
Storage Capacity (GB)	Up to 512 (micro SD card not included)
Motion Detection	Yes
Bit Rate	128 Kbps ~ 16 Mbps
Compression Type	Ultra265, H.265, H.264, MJPEG
Starlight +	Yes
Active Deterrent	No
NDAA Compliant	Yes
Reset Button	No
Brand	Alibi Vigilant
Warranty	3-Year
https://www.alibisecurity.com/media/docs/ali-pm80-vluai-d-datasheet-as.pdf
https://www.alibisecurity.com/blog/post/alibi-product-matrix
https://www.alibisecurity.com/blog/post/alibi-vigilant-mobile-app
https://www.alibisecurity.com/blog/post/power-distance
https://www.alibisecurity.com/media/docs/ali-vig-ipc-usermanual-br.pdf
https://www.alibisecurity.com/media/docs/ip-camera-installation-guide.pdf
https://www.alibisecurity.com/media/docs/ali-sitesurveyguide-br.pdf
https://www.alibisecurity.com/blog/post/alibi-vigilant-camera-firmware','Alibi ALI-PM80-VLUAI-D Starlight+ 8MP IP Fixed Vandal-Resistant Wedge Dome','Alibi ALI-PM80-VLUAI-D Starlight+ 8MP IP Fixed Vandal-Resistant Wedge Dome. NDAA compliant. Authorized Alibi dealer, ships from New York.','alibi, ali-pm80-vluai-d, starlight, ip camera, dome camera, ndaa','','ALI-PM80-VLUAI-D','8MP IP wedge dome camera
2.8mm lens with 104 degrees Field of View
130dB true WDR technology enables clear image in strong light scene
Support 9:16 Corridor Mode
Alarm I/O: 1/1, audio I/O: 1/1
Built-in dual-mic and speaker
Smart IR, up to 98.4 ft IR distance
White light, up to 98.4 ft warm light distance
Supports 512 G Micro SD card
IK10 vandal resistant
IP67 protection
NDAA compliant','[{"label": "NDAA", "detail": "NDAA Compliant - meets the product technical requirements of NDAA Section 889", "icon": "/media/p_f8cbae82-4349-48a6-83af-8cebe63cdd9a.png"}, {"label": "Starlight", "detail": "Starlight chipset with a super low light LUX rating", "icon": "/media/p_03ae7540-e2b2-4a7a-88cb-2d1ce56fae41.png"}, {"label": "Audio Mic", "detail": "Includes Built-in mic.", "icon": "/media/p_06f9cc60-9191-48c6-8bc9-95cf6fc8c7c1.png"}, {"label": "IP67", "detail": "IP67 Weather Rated Enclosure – Ideal for outdoor applications", "icon": "/media/p_1f4ccdb1-34be-4c19-9c10-39878257ce7d.png"}, {"label": "WDR", "detail": "Wide Dynamic Range – Gain better images in diverse lighting conditions", "icon": "/media/p_3b868fc0-904f-4642-bfcc-6944396dd866.png"}, {"label": "IK10", "detail": "IK10 rated vandalproof housing - resists impact effectively", "icon": "/media/p_34b15106-5e79-4128-8f1a-668de435eefb.png"}, {"label": "3D-DNR", "detail": "3D Digital Noise Reduction – Get exceptional video image quality with less noise", "icon": "/media/p_218ec18d-0a39-4fa6-8850-6f3f5af393ba.png"}, {"label": "ONVIF", "detail": "ONVIF Certified", "icon": "/media/p_e020abd0-1488-40b5-b565-6e2dc8f15bff.png"}]','',0);
INSERT OR IGNORE INTO products (slug,name,brand,brand_slug,category,price_cents,msrp_cents,cost_cents,blurb,image,featured,stock,stock_tracked,active,specs,meta_title,meta_description,meta_keywords,gtin,mpn,highlights,badges,options,addon) VALUES ('ali-pt40-vluais-d','Alibi ALI-PT40-VLUAIS-D Vigilant 4MP 98 Feet IllumiNite-IR Starlight+ IntelliSearch Vandal IP Turret Camera w/Built-in Mic and Speaker','ALIBI','alibi','security-ip-cameras',41799,43999,NULL,'**Alibi Vigilant 4MP 98 Feet IllumiNite-IR Starlight+ IntelliSearch Vandal IP Turret Camera w/Built-in Mic and Speaker**
SKU ALI-PT40-VLUAIS-D

The Alibi Vigilant Performance Series, 4MP Starlight+ Turret Security Camera delivers crisp video day or night.

**IntelliSearch Color Match Technology -** Powerful camera analytics capture apparel colors and vehicle color and apply metadata to the video recording. Using powerful search algorithms, users can apply filters to quickly search for upper or lower garment color or vehicle exterior color significantly reducing the amount of time needed to search video footage.

**Color Attribute Collection –** Advanced technology collects the color information of the target with high accuracy for identification of a human’s upper and lower garment, color of a vehicle, and upper garment color of the driver of a non-motor vehicle.

**Auto Scene Adjustment (intelligent WDR) –** Allows camera to easily and quickly improve image quality in high-contrast lighting conditions (foggy, backlit, flickering) and capture details in both areas of the video that are dimly and brightly lit.

**SmartSense Technology** – Utilizes AI deep learning developed data algorithms to identify human and vehicular targets with extreme accuracy and reduce false alarms.

**Capture Color Video at Night –** Starlight technology chipset uses ambient light sources to capture color video in extreme low light conditions. In the darkness, you can rely on the camera’s full-frame illumination technology to see clear, sharp images up to 98 feet in the dark.

**Superior Outdoor Performance** – With an IP67 weather-rated metal enclosure, this turret camera offers long-term durability even among extreme weather conditions such as rain, snow, and ice and has a wide temperature range of -22 degrees to 140 degrees Fahrenheit.

**3D Digital Noise Reduction (DNR)** - effectively filters noise to produce a crisper, clear video stream.

**Key Features and Capabilities**

**Multi-megapixel resolution – Get more detail from your video camera.** This camera captures multi-megapixel resolution video footage that delivers crisp, clear detail and clarity for your video security needs.

**Starlight+ Technology** – featuring an HD progressive scan CMOS sensor, this next-generation Starlight chipset can capture clear and vivid color images day or night – even in extremely dark environments.

**Full Frame IllumiNite technology with Smart IR -**Smart full-frame illumination technology offers several advantages over standard IR for flawless night vision, including:

Clearer, brighter images in low light and at night
Delivers a wider illumination spread
Unique rectangular IR LED design produces a uniformly illuminated image across the entire screen
Reduces overexposure at the center of the image and eliminates hot spots
Eliminates blooming from lights by reducing ambient light pollution
Reduces video noise for a clearer nighttime picture and reduces bandwidth consumption and video storage requirements

**Innovative Day/Night Scene Detection** – includes a hardware sensor for intelligent software imaging that detects surveillance scene illumination. Designed to be water and dust-proof, this allows you to avoid unexpected costs of hardware failure

**HTML5 Plugin Free –** use on almost any Browser for support:

Plug-in required live view: IE9+, Chrome 41 and below, Firefox 52 and below
Plug-in free live view: Chrome 57.0+, Firefox 58.0+, Edge 16+, Safari 11+

**Ultra H.265 Compression – reduce bandwidth and storage requirements.** With Ultra H.265 compression technology, you can store more information using less hard drive space. Ultra H.265 also helps you minimize bandwidth requirements for high-resolution video and makes the remote viewing less demanding on the recorder.

**Intuitive interface – everything you need to manage your system at your fingertips.** System management has never been simpler with an intuitive interface and access to the free Vigilant Mobile App and Vigilant CMS.

**What’s Included:**

(1) Alibi Vigilant Performance Series 4MP Starlight+ turret security camera
(1) Mounting template
(1) Mounting hardware
(1) Quick start guide

Smart Analytics Supports:

Color Search
Motion Detection
Ultra Motion Detection
Line Crossing Detection
Intrusion Detection
Enter/Exit Alert
Human Detection
Motor Vehicle Detection
Non-Motor Vehicle Detection
Face Detection
People Flow Counting
Crowd Density Monitoring
Audio Detection
Tampering Alarm
Object Left Behind
Object Removed

**Protection and Warranty:**

Covered by Alibi''s 3-Year Warranty on the camera and recorder hardware and components, with unlimited US-based technical support. Questions before or after you buy? Call the shop and we will help you choose and set it up.','/img/alibi/ali-pt40-vluais-d-1.jpg',0,0,0,1,'Audio	Yes
Audio Compression	G.711U, G.711A
Audio Streaming	Two-way
Sensor Inputs	1
connectors	1 RJ45 10M/100M Base - TX Ethernet
Lux (B/W)	0.0 (IR ON)
Lux (Color)	0.0003
Megapixel	4.0
IR Wavelength (nm)	850
Illumination Distance (ft)	98
Dynamic Range (dB)	130
Electronic Shutter	1 ~ 1/100,000 sec
Imager Size (in)	1/1.8
Imager Type	CMOS
Wide Dynamic	Yes
Pan Angle	0° ~ 360°
Rotate Angle	0° ~ 360°
Operating Temperature (F)	-40° ~ 140°
Operating Humidity	0% ~ 95% (non-condensing)
Weight (lb)	1.9
Vandal-proof	IK10
Construction	Metal
Certification	CE, UL, FCC part 15, CE-RoHS
Dimensions	128.7 mm × 110.3 mm (5.1 × 4.3 inch)
Ingress Protection	IP67
Heater	Yes
Focal Length (mm)	2.8
Relative Aperture (F-stop)	F1
Lens Type	Fixed
Lens Iris	fixed
FOV (Field of View)	111.0
802.3	802.3af
Compatibility	Ai-RGUS (ONVIF), Avigilon (ONVIF), Digital Watchdog (ONVIF), Exacq Vision (ONVIF), Network Optix (ONVIF), Open Eye (ONVIF), Salient (ONVIF)
Compatible Integrations	ONVIF (Profile S, Profile G, Profile T, Profile M), API, SDK
Power (w)	DC12V(±25%), PoE(IEEE 802.3af); Max 6.2W
Storage Capacity (GB)	Up to 256 (micro SD card not included)
Bit Rate	128 Kbps ~ 16 Mbps
Starlight +	Yes
Active Deterrent	Yes
NDAA Compliant	Yes
Reset Button	Yes
Brand	Alibi Vigilant
Warranty	3-Year
https://www.alibisecurity.com/media/docs/ali-pt40-vluais-d-datasheet-as.pdf
https://www.alibisecurity.com/blog/post/alibi-product-matrix
https://www.alibisecurity.com/blog/post/alibi-vigilant-mobile-app
https://www.alibisecurity.com/blog/post/power-distance
https://www.alibisecurity.com/media/docs/ali-vig-ipc-usermanual-br.pdf
https://www.alibisecurity.com/media/docs/ip-camera-installation-guide.pdf
https://www.alibisecurity.com/blog/post/alibi-vigilant-camera-firmware','Alibi ALI-PT40-VLUAIS-D 4MP 98 Feet IllumiNite-IR Starlight+ IntelliSearch','Alibi ALI-PT40-VLUAIS-D 4MP 98 Feet IllumiNite-IR Starlight+ IntelliSearch. NDAA compliant. Authorized Alibi dealer, ships from New York.','alibi, ali-pt40-vluais-d, starlight, ip camera, turret camera, ndaa','','ALI-PT40-VLUAIS-D','4MP high-resolution 2688 × 1520 @ 30fps
2.8mm @ F1.0
111.0 degrees horizontal FOV to capture large areas
Smart IR up to 98 feet nighttime viewing
Color Attribute Collection
IntelliSearch Color Match Technology
Starlight+ technology - Color: 0.0003 Lux, 0 Lux with IR
130dB True Wide Dynamic Range (WDR)
Supports red & blue warning lights for Active Deterrence
Built-in mic and speaker
Audio I/O 1 in 1 out; Alarm 1 in/1 out
Micro SD, up to 512 GB
Supports Ultra 265, H.265, H.264, and MJPEG
ANR, NAS(NFS) Network Storage
IP67 weather-resistant rating
IK10 vandal resistant
NDAA Compliant
One-click Cloud firmware updating','[{"label": "NDAA", "detail": "NDAA Compliant - meets the product technical requirements of NDAA Section 889", "icon": "/media/p_f8cbae82-4349-48a6-83af-8cebe63cdd9a.png"}, {"label": "Starlight", "detail": "Starlight chipset with a super low light LUX rating", "icon": "/media/p_03ae7540-e2b2-4a7a-88cb-2d1ce56fae41.png"}, {"label": "Audio Mic", "detail": "Includes Built-in mic.", "icon": "/media/p_06f9cc60-9191-48c6-8bc9-95cf6fc8c7c1.png"}, {"label": "IP67", "detail": "IP67 Weather Rated Enclosure – Ideal for outdoor applications", "icon": "/media/p_1f4ccdb1-34be-4c19-9c10-39878257ce7d.png"}, {"label": "WDR", "detail": "Wide Dynamic Range – Gain better images in diverse lighting conditions", "icon": "/media/p_3b868fc0-904f-4642-bfcc-6944396dd866.png"}, {"label": "IK10", "detail": "IK10 rated vandalproof housing - resists impact effectively", "icon": "/media/p_34b15106-5e79-4128-8f1a-668de435eefb.png"}, {"label": "ONVIF", "detail": "ONVIF Certified", "icon": "/media/p_e020abd0-1488-40b5-b565-6e2dc8f15bff.png"}, {"label": "1-Click", "detail": "One-click Cloud firmware updating.", "icon": "/media/p_29411a7b-1eaa-476f-bb42-bc698fd2be7e.png"}]','',0);
INSERT OR IGNORE INTO products (slug,name,brand,brand_slug,category,price_cents,msrp_cents,cost_cents,blurb,image,featured,stock,stock_tracked,active,specs,meta_title,meta_description,meta_keywords,gtin,mpn,highlights,badges,options,addon) VALUES ('ali-pt80-vluais-d','Alibi ALI-PT80-VLUAIS-D Vigilant 8MP 98 Feet IllumiNite-IR Starlight+ IntelliSearch Vandal IP Turret Camera w/Built-in Mic and Speaker','ALIBI','alibi','security-ip-cameras',53199,55999,NULL,'**Alibi Vigilant 8MP 98 Feet IllumiNite-IR Starlight+ IntelliSearch Vandal IP Turret Camera w/Built-in Mic and Speaker**
SKU ALI-PT80-VLUAIS-D

The Alibi Vigilant Performance Series, 8MP Starlight+ Turret Security Camera delivers crisp video day or night.

**IntelliSearch Color Match Technology -** Powerful camera analytics capture apparel colors and vehicle color and apply metadata to the video recording. Using powerful search algorithms, users can apply filters to quickly search for upper or lower garment color or vehicle exterior color significantly reducing the amount of time needed to search video footage.

**Color Attribute Collection –** Advanced technology collects the color information of the target with high accuracy for identification of a human’s upper and lower garment, color of a vehicle, and upper garment color of the driver of a non-motor vehicle.

**Auto Scene Adjustment (intelligent WDR) –** Allows camera to easily and quickly improve image quality in high-contrast lighting conditions (foggy, backlit, flickering) and capture details in both areas of the video that are dimly and brightly lit.

**SmartSense Technology** – Utilizes AI deep learning developed data algorithms to identify human and vehicular targets with extreme accuracy and reduce false alarms.

**Capture Color Video at Night –** Starlight technology chipset uses ambient light sources to capture color video in extreme low light conditions. In the darkness, you can rely on the camera’s full-frame illumination technology to see clear, sharp images up to 98 feet in the dark.

**Superior Outdoor Performance** – With an IP67 weather-rated metal enclosure, this turret camera offers long-term durability even among extreme weather conditions such as rain, snow, and ice and has a wide temperature range of -22 degrees to 140 degrees Fahrenheit.

**3D Digital Noise Reduction (DNR)** - effectively filters noise to produce a crisper, clear video stream.

**Key Features and Capabilities**

**Multi-megapixel resolution – Get more detail from your video camera.** This camera captures multi-megapixel resolution video footage that delivers crisp, clear detail and clarity for your video security needs.

**Starlight+ Technology** – featuring an HD progressive scan CMOS sensor, this next-generation Starlight chipset can capture clear and vivid color images day or night – even in extremely dark environments.

**Full Frame IllumiNite technology with Smart IR -**Smart full-frame illumination technology offers several advantages over standard IR for flawless night vision, including:

Clearer, brighter images in low light and at night
Delivers a wider illumination spread
Unique rectangular IR LED design produces a uniformly illuminated image across the entire screen
Reduces overexposure at the center of the image and eliminates hot spots
Eliminates blooming from lights by reducing ambient light pollution
Reduces video noise for a clearer nighttime picture and reduces bandwidth consumption and video storage requirements

**Innovative Day/Night Scene Detection** – includes a hardware sensor for intelligent software imaging that detects surveillance scene illumination. Designed to be water and dust-proof, this allows you to avoid unexpected costs of hardware failure

**HTML5 Plugin Free –** use on almost any Browser for support:

Plug-in required live view: IE9+, Chrome 41 and below, Firefox 52 and below
Plug-in free live view: Chrome 57.0+, Firefox 58.0+, Edge 16+, Safari 11+

**Ultra H.265 Compression – reduce bandwidth and storage requirements.** With Ultra H.265 compression technology, you can store more information using less hard drive space. Ultra H.265 also helps you minimize bandwidth requirements for high-resolution video and makes the remote viewing less demanding on the recorder.

**Intuitive interface – everything you need to manage your system at your fingertips.** System management has never been simpler with an intuitive interface and access to the free Vigilant Mobile App and Vigilant CMS.

**What’s Included:**

(1) Alibi Vigilant Performance Series 8MP Starlight+ turret security camera
(1) Mounting template
(1) Mounting hardware
(1) Quick start guide

Smart Analytics Supports:

Color Search
Motion Detection
Ultra Motion Detection
Line Crossing Detection
Intrusion Detection
Enter/Exit Alert
Human Detection
Motor Vehicle Detection
Non-Motor Vehicle Detection
Face Detection
People Flow Counting
Crowd Density Monitoring
Audio Detection
Tampering Alarm
Object Left Behind
Object Removed

**Protection and Warranty:**

Covered by Alibi''s 3-Year Warranty on the camera and recorder hardware and components, with unlimited US-based technical support. Questions before or after you buy? Call the shop and we will help you choose and set it up.','/img/alibi/ali-pt80-vluais-d-1.jpg',0,0,0,1,'Audio	Yes
Audio Compression	G.711U, G.711A
Audio Streaming	Two-way
Sensor Inputs	1
connectors	1 RJ45 10M/100M Base - TX Ethernet
Lux (B/W)	0.0 (IR ON)
Lux (Color)	0.0005 (0.0 with light)
Megapixel	8.0 (4K)
IR Wavelength (nm)	850
Illumination Distance (ft)	98
Dynamic Range (dB)	130
Electronic Shutter	1 ~ 1/100,000 sec
Imager Size (in)	1/1.8
Imager Type	CMOS
Wide Dynamic	Yes
Pan Angle	0° ~ 360°
Rotate Angle	0° ~ 360°
Operating Temperature (F)	-40° ~ 140°
Operating Humidity	0% ~ 95% (non-condensing)
Weight (lb)	1.9
Vandal-proof	IK10
Construction	Metal
Certification	CE, UL, FCC part 15, CE-RoHS
Dimensions	128.7 mm × 110.3 mm (5.1 × 4.3 inch)
Ingress Protection	IP67
Heater	Yes
Focal Length (mm)	2.8
Relative Aperture (F-stop)	F1
Lens Type	Fixed
Lens Iris	fixed
FOV (Field of View)	108.1
802.3	802.3af
Compatibility	Ai-RGUS (ONVIF), Avigilon (ONVIF), Digital Watchdog (ONVIF), Exacq Vision (ONVIF), Network Optix (ONVIF), Open Eye (ONVIF), Salient (ONVIF)
Compatible Integrations	ONVIF (Profile S, Profile G, Profile T, Profile M), API, SDK
Power (w)	DC12V(±25%), PoE(IEEE 802.3af); Max 6.2W
Storage Capacity (GB)	Up to 256 (micro SD card not included)
Bit Rate	128 Kbps ~ 16 Mbps
Starlight +	Yes
Active Deterrent	Yes
NDAA Compliant	Yes
Reset Button	Yes
Brand	Alibi Vigilant
Warranty	3-Year
https://www.alibisecurity.com/media/docs/ali-pt80-vluais-d-datasheet-as.pdf
https://www.alibisecurity.com/blog/post/alibi-product-matrix
https://www.alibisecurity.com/blog/post/alibi-vigilant-mobile-app
https://www.alibisecurity.com/blog/post/power-distance
https://www.alibisecurity.com/media/docs/ali-vig-ipc-usermanual-br.pdf
https://www.alibisecurity.com/media/docs/ip-camera-installation-guide.pdf
https://www.alibisecurity.com/blog/post/alibi-vigilant-camera-firmware','Alibi ALI-PT80-VLUAIS-D 8MP 98 Feet IllumiNite-IR Starlight+ IntelliSearch','Alibi ALI-PT80-VLUAIS-D 8MP 98 Feet IllumiNite-IR Starlight+ IntelliSearch. NDAA compliant. Authorized Alibi dealer, ships from New York.','alibi, ali-pt80-vluais-d, starlight, ip camera, turret camera, ndaa','','ALI-PT80-VLUAIS-D','8MP high-resolution 3840 x 2160 @ 30fps
2.8mm @ F1.0
108.1 degrees horizontal FOV to capture large areas
Smart IR up to 98 feet nighttime viewing
Color Attribute Collection
IntelliSearch Color Match Technology
Starlight+ technology - Color: 0.0005 Lux, 0 Lux with IR
130dB True Wide Dynamic Range (WDR)
Supports red & blue warning lights for Active Deterrence
Built-in mic and speaker
Audio I/O 1 in 1 out; Alarm 1 in/1 out
Micro SD, up to 512 GB
Supports Ultra 265, H.265, H.264, and MJPEG
ANR, NAS(NFS) Network Storage
IP67 weather-resistant rating
IK10 vandal resistant
NDAA Compliant
One-click Cloud firmware updating','[{"label": "NDAA", "detail": "NDAA Compliant - meets the product technical requirements of NDAA Section 889", "icon": "/media/p_f8cbae82-4349-48a6-83af-8cebe63cdd9a.png"}, {"label": "Starlight", "detail": "Starlight chipset with a super low light LUX rating", "icon": "/media/p_03ae7540-e2b2-4a7a-88cb-2d1ce56fae41.png"}, {"label": "Audio Mic", "detail": "Includes Built-in mic.", "icon": "/media/p_06f9cc60-9191-48c6-8bc9-95cf6fc8c7c1.png"}, {"label": "IP67", "detail": "IP67 Weather Rated Enclosure – Ideal for outdoor applications", "icon": "/media/p_1f4ccdb1-34be-4c19-9c10-39878257ce7d.png"}, {"label": "WDR", "detail": "Wide Dynamic Range – Gain better images in diverse lighting conditions", "icon": "/media/p_3b868fc0-904f-4642-bfcc-6944396dd866.png"}, {"label": "IK10", "detail": "IK10 rated vandalproof housing - resists impact effectively", "icon": "/media/p_34b15106-5e79-4128-8f1a-668de435eefb.png"}, {"label": "ONVIF", "detail": "ONVIF Certified", "icon": "/media/p_e020abd0-1488-40b5-b565-6e2dc8f15bff.png"}, {"label": "1-Click", "detail": "One-click Cloud firmware updating.", "icon": "/media/p_29411a7b-1eaa-476f-bb42-bc698fd2be7e.png"}]','',0);
INSERT OR IGNORE INTO products (slug,name,brand,brand_slug,category,price_cents,msrp_cents,cost_cents,blurb,image,featured,stock,stock_tracked,active,specs,meta_title,meta_description,meta_keywords,gtin,mpn,highlights,badges,options,addon) VALUES ('ali-pt80-uai-d','Alibi ALI-PT80-UAI-D Vigilant Performance Series 8MP IP IntelliSearch Starlight 131 Feet IR Turret Camera','ALIBI','alibi','security-ip-cameras',45599,47999,NULL,'**Alibi Vigilant Performance Series 8MP IP IntelliSearch Starlight 131 Feet IR Turret Camera**
SKU ALI-PT80-UAI-D

The Alibi Vigilant Performance Series, **8 MP 131 feet IR Fixed Turret Camera** delivers crisp video day or night. It also offers flexible storage solutions, with a built-in micro-SD slot – enabling local storage of up to 512GB, and includes a built-in mic for powerful audio surveillance.

**3D Digital Noise Reduction (DNR)** effectively filters noise to produce a crisper, clear video stream.

**IP67 weatherproof housing -** this turret camera delivers long-term durability even among extreme weather conditions such as rain, snow, and ice and has a wide temperature range of -22 degrees to 140 degrees Fahrenheit.

**Key Features and Capabilities**

**Multi-megapixel resolution – Get more detail from your video camera.** This camera captures multi-megapixel high-resolution video footage that delivers crisp, precise detail and clarity for your video security needs.

**IntelliSearch Color Match Technology** - Powerful camera analytics capture apparel colors and vehicle color and apply metadata to the video recording. Using powerful search algorithms, users can apply filters to quickly search for upper or lower garment color or vehicle exterior color significantly reducing the amount of time needed to search video footage.

**Starlight Chipset Technology –** featuring an HD progressive scan CMOS sensor, capturing clear and vivid color images day or night – even in extremely dark environments.

**True Day/Night feature** – allowing you to capture better images in any lighting conditions.

**Full Frame Illumination with Smart IR** Smart full-frame illumination technology offers several advantages over standard IR for flawless night vision, including:

Clearer, brighter images in low light and at night
Reduces overexposure of the IR LEDs at the center of the image
Increases illuminant efficiency up to 30%
Produces LED light in rectangle form to better fit screen size
Captures images up to 66 feet in the dark without washing out the subject at closer ranges
Reduces video noise for a clearer nighttime picture and reduces bandwidth consumption and video storage requirements

**Innovative Day/Night Scene Detection** – includes a hardware sensor for smart software imaging that detects surveillance scene illumination. Designed to be water and dust-proof, this allows you to avoid unexpected costs of hardware failure.

**HTML5 Plugin Free –** use on almost any Browser for support:

Plug-in required live view: IE9+, Chrome 41 and below, Firefox 52 and below
Plug-in free live view: Chrome 57.0+, Firefox 58.0+, Edge 16+, Safari 11+

**Ultra H.265 Compression – reduce bandwidth and storage requirements.** With Ultra H.265 compression technology, you can store more information using less hard drive space. Ultra H.265 also helps you minimize bandwidth requirements for high-resolution video and makes the remote viewing less demanding on the recorder.

**Intuitive interface – everything you need to manage your system at your fingertips.** With an intuitive interface and access to the free Vigilant Mobile App and Vigilant CMS, system management has never been simpler.

**What’s Included:**

(1) Alibi Vigilant Performance Series 8MP IP turret security camera
(1) Mounting template
(1) Mounting hardware
(1) Quick start guide

**Protection and Warranty:**

Covered by Alibi''s 3-Year Warranty on the camera and recorder hardware and components, with unlimited US-based technical support. Questions before or after you buy? Call the shop and we will help you choose and set it up.','/img/alibi/ali-pt80-uai-d-1.jpg',0,0,0,1,'Audio	Yes
Audio Compression	G.711U, G.711A
Audio Streaming	Two-way
Alarm Output	Yes
Alarm Outputs	1
Audio In	1
Audio Out	1
AGC Control	Yes
Lux (B/W)	0.0 (IR ON)
Lux (Color)	0.002
Megapixel	8.0 (4K)
OSD	Yes
IR Wavelength (nm)	850
Illumination Distance (ft)	130
Day/Night Function	Yes
Digital Noise Reduction (DNR)	2D + 3D DNR
Electronic Shutter	1 ~ 1/100,000 sec
Flip	Yes
Imager Size (in)	1/2.8
Imager Type	Progressive Scan CMOS
Wide Dynamic	Yes
Product Color	White/Black
Pan Angle	0° ~ 360°
Rotate Angle	0° ~ 360°
Outdoor	Yes
Operating Temperature (F)	-22° ~ 140°
Operating Humidity	0% ~ 95% (non-condensing)
Weight (lb)	1.5
Vandal-proof	No
Construction	Metal
Certification	CE-EMC, FCC, CE-LVD, CE-RoHS, UL, WEEE, IP67
Dimensions	Ø129 x 110mm (Ø5.1" x 4.3")
Ingress Protection	IP67
Focal Length (mm)	2.8
Relative Aperture (F-stop)	F1.6
Lens Type	Fixed
FOV (Field of View)	97.49 degrees
802.3	802.3af
Compatibility	Eagle Eye VMS, Ai-RGUS (ONVIF), Avigilon (ONVIF), Digital Watchdog (ONVIF), Exacq Vision (ONVIF), Network Optix (ONVIF), Open Eye (ONVIF), Salient (ONVIF)
Compatible Integrations	ONVIF (Profile S, Profile G, Profile T), API, SDK
Ethernet Ports	1
Ethernet	Yes
Power Supply Included	No
Power (w)	DC 12V±25%, PoE (IEEE 802.3af)
PoE	IEEE802.3af
Privacy Video Block	Yes
Storage Capacity (GB)	500
Motion Detection	Yes
Bit Rate	128 Kbps ~ 16 Mbps
Compression Type	Ultra265, H.265, H.264, MJPEG
Mobile App	iOS & Android
Active Deterrent	No
NDAA Compliant	Yes
Reset Button	Yes
Brand	Alibi Vigilant
Warranty	3-Year
https://www.alibisecurity.com/media/docs/ali-pt80-uai-d-datasheet-as.pdf
https://www.alibisecurity.com/blog/post/alibi-product-matrix
https://www.alibisecurity.com/blog/post/alibi-vigilant-mobile-app
https://www.alibisecurity.com/blog/post/power-distance
https://www.alibisecurity.com/media/docs/ali-vig-ipc-usermanual-br.pdf
https://www.alibisecurity.com/media/docs/Camera Installation Guide - IP Turret with built-in JB-V2.00.pdf
https://www.alibisecurity.com/blog/post/alibi-vigilant-camera-firmware','Alibi ALI-PT80-UAI-D 8MP IP IntelliSearch Starlight 131 Feet IR Turret','Alibi ALI-PT80-UAI-D 8MP IP IntelliSearch Starlight 131 Feet IR Turret. NDAA compliant. Authorized Alibi dealer, ships from New York.','alibi, ali-pt80-uai-d, starlight, ip camera, turret camera, ndaa','','ALI-PT80-UAI-D','8MP resolution 3840 x 2160 @ 30fps
1/2.8" CMOS sensor
Ultra 265, H.265, H.264, MJPEG
IntelliSearch Smart Color Technology
Intelligent perimeter protection, include cross line, intrusion, enter area, leave area detection
Based on target classification, smart intrusion prevention significantly reduce false alarm caused by leaves, birds and lights etc., accurately focus on human and, motor vehicle and non-motor vehicle
Intelligent People Flow Counting and Crowd Density Monitoring
Smart IR up to 131 feet nighttime viewing
Starlight technology: 0.002Lux, 0 Lux with IR
Built-in mic
MicroSD, up to 512GB
ONVIF (Profile S, Profile G, Profile T, Profile M), API, SDK
130dB true WDR technology enables clear image in strong light scene
Auto Scene Match (ASM)（Only WDR）
IP67 protection rating
Meets NDAA federal government compliance requirements
Support 9:16 Corridor Mode
Alarm:1 in/1 out, Audio: 1 in/1 out, Built-in Mic','[{"label": "NDAA", "detail": "NDAA Compliant - meets the product technical requirements of NDAA Section 889", "icon": "/media/p_f8cbae82-4349-48a6-83af-8cebe63cdd9a.png"}, {"label": "Starlight", "detail": "Starlight chipset with a super low light LUX rating", "icon": "/media/p_03ae7540-e2b2-4a7a-88cb-2d1ce56fae41.png"}, {"label": "Audio Mic", "detail": "Includes Built-in mic.", "icon": "/media/p_06f9cc60-9191-48c6-8bc9-95cf6fc8c7c1.png"}, {"label": "IP67", "detail": "IP67 Weather Rated Enclosure – Ideal for outdoor applications", "icon": "/media/p_1f4ccdb1-34be-4c19-9c10-39878257ce7d.png"}, {"label": "WDR", "detail": "Wide Dynamic Range – Gain better images in diverse lighting conditions", "icon": "/media/p_3b868fc0-904f-4642-bfcc-6944396dd866.png"}, {"label": "3D-DNR", "detail": "3D Digital Noise Reduction – Get exceptional video image quality with less noise", "icon": "/media/p_218ec18d-0a39-4fa6-8850-6f3f5af393ba.png"}, {"label": "ONVIF", "detail": "ONVIF Certified", "icon": "/media/p_e020abd0-1488-40b5-b565-6e2dc8f15bff.png"}]','',0);
INSERT OR IGNORE INTO products (slug,name,brand,brand_slug,category,price_cents,msrp_cents,cost_cents,blurb,image,featured,stock,stock_tracked,active,specs,meta_title,meta_description,meta_keywords,gtin,mpn,highlights,badges,options,addon) VALUES ('ali-pt80-vluzais-d','Alibi ALI-PT80-VLUZAIS-D Vigilant 8MP 98 Feet IllumiNite-IR Starlight+ IntelliSearch Vandal IP Turret Camera w/Built-in Mic and Speaker','ALIBI','alibi','security-ip-cameras',83599,87999,NULL,'**Alibi Vigilant 8MP 98 Feet IllumiNite-IR Starlight+ IntelliSearch Vandal IP Turret Camera w/Built-in Mic and Speaker**
SKU ALI-PT80-VLUZAIS-D

The Alibi Vigilant Performance Series, 8MP Varifocal Starlight+ Turret Security Camera delivers crisp video day or night.

**IntelliSearch Color Match Technology -** Powerful camera analytics capture apparel colors and vehicle color and apply metadata to the video recording. Using powerful search algorithms, users can apply filters to quickly search for upper or lower garment color or vehicle exterior color significantly reducing the amount of time needed to search video footage.

**Color Attribute Collection –** Advanced technology collects the color information of the target with high accuracy for identification of a human’s upper and lower garment, color of a vehicle, and upper garment color of the driver of a non-motor vehicle.

**Auto Scene Adjustment (intelligent WDR) –** Allows camera to easily and quickly improve image quality in high-contrast lighting conditions (foggy, backlit, flickering) and capture details in both areas of the video that are dimly and brightly lit.

**SmartSense Technology** – Utilizes AI deep learning developed data algorithms to identify human and vehicular targets with extreme accuracy and reduce false alarms.

**Capture Color Video at Night –** Starlight technology chipset uses ambient light sources to capture color video in extreme low light conditions. In the darkness, you can rely on the camera’s full-frame illumination technology to see clear, sharp images up to 98 feet in the dark.

**Superior Outdoor Performance** – With an IP67 weather-rated metal enclosure, this turret camera offers long-term durability even among extreme weather conditions such as rain, snow, and ice and has a wide temperature range of -22 degrees to 140 degrees Fahrenheit.

**3D Digital Noise Reduction (DNR)** - effectively filters noise to produce a crisper, clear video stream.

**Key Features and Capabilities**

**Multi-megapixel resolution – Get more detail from your video camera.** This camera captures multi-megapixel resolution video footage that delivers crisp, clear detail and clarity for your video security needs.

**Starlight+ Technology** – featuring an HD progressive scan CMOS sensor, this next-generation Starlight chipset can capture clear and vivid color images day or night – even in extremely dark environments.

**Full Frame IllumiNite technology with Smart IR -**Smart full-frame illumination technology offers several advantages over standard IR for flawless night vision, including:

Clearer, brighter images in low light and at night
Delivers a wider illumination spread
Unique rectangular IR LED design produces a uniformly illuminated image across the entire screen
Reduces overexposure at the center of the image and eliminates hot spots
Eliminates blooming from lights by reducing ambient light pollution
Reduces video noise for a clearer nighttime picture and reduces bandwidth consumption and video storage requirements

**Innovative Day/Night Scene Detection** – includes a hardware sensor for intelligent software imaging that detects surveillance scene illumination. Designed to be water and dust-proof, this allows you to avoid unexpected costs of hardware failure

**HTML5 Plugin Free –** use on almost any Browser for support:

Plug-in required live view: IE9+, Chrome 41 and below, Firefox 52 and below
Plug-in free live view: Chrome 57.0+, Firefox 58.0+, Edge 16+, Safari 11+

**Ultra H.265 Compression – reduce bandwidth and storage requirements.** With Ultra H.265 compression technology, you can store more information using less hard drive space. Ultra H.265 also helps you minimize bandwidth requirements for high-resolution video and makes the remote viewing less demanding on the recorder.

**Intuitive interface – everything you need to manage your system at your fingertips.** System management has never been simpler with an intuitive interface and access to the free Vigilant Mobile App and Vigilant CMS.

**What’s Included:**

(1) Alibi Vigilant Performance Series 8MP Starlight+ turret security camera
(1) Mounting template
(1) Mounting hardware
(1) Quick start guide

Smart Analytics Supports:

Color Search
Motion Detection
Ultra Motion Detection
Line Crossing Detection
Intrusion Detection
Enter/Exit Alert
Human Detection
Motor Vehicle Detection
Non-Motor Vehicle Detection
Face Detection
People Flow Counting
Crowd Density Monitoring
Audio Detection
Tampering Alarm
Object Left Behind
Object Removed

**Protection and Warranty:**

Covered by Alibi''s 3-Year Warranty on the camera and recorder hardware and components, with unlimited US-based technical support. Questions before or after you buy? Call the shop and we will help you choose and set it up.','/img/alibi/ali-pt80-vluzais-d-1.jpg',0,0,0,1,'Audio	Yes
Audio Compression	G.711U, G.711A
Audio Streaming	Two-way
Sensor Inputs	1
connectors	1 RJ45 10M/100M Base - TX Ethernet
Lux (B/W)	0.0 (IR ON)
Lux (Color)	0.0005 (0.0 with light)
Megapixel	8.0 (4K)
IR Wavelength (nm)	850
Illumination Distance (ft)	98
Dynamic Range (dB)	130
Electronic Shutter	1 ~ 1/100,000 sec
Imager Size (in)	1/1.8
Imager Type	CMOS
Wide Dynamic	Yes
Pan Angle	0° ~ 360°
Rotate Angle	0° ~ 360°
Operating Temperature (F)	-40° ~ 140°
Operating Humidity	0% ~ 95% (non-condensing)
Weight (lb)	2.2
Vandal-proof	IK10
Speakers	Yes
Construction	Metal
Certification	CE, UL, FCC part 15, CE-RoHS
Dimensions	128.7 mm × 110.3 mm (5.1 × 4.3 inch)
Ingress Protection	IP67
Heater	Yes
Focal Length (mm)	2.8 - 12 mm
Relative Aperture (F-stop)	F1
Lens Type	Motorized Varifocal
Lens Iris	fixed
FOV (Field of View)	111.5 to 54.1
802.3	802.3af
Compatibility	Ai-RGUS (ONVIF), Avigilon (ONVIF), Digital Watchdog (ONVIF), Exacq Vision (ONVIF), Network Optix (ONVIF), Open Eye (ONVIF), Salient (ONVIF)
Compatible Integrations	ONVIF (Profile S, Profile G, Profile T, Profile M), API, SDK
Power (w)	DC12V(±25%), PoE(IEEE 802.3af); Max 7.0W
Storage Capacity (GB)	Up to 256 (micro SD card not included)
Bit Rate	128 Kbps ~ 16 Mbps
Starlight +	Yes
Active Deterrent	Yes
NDAA Compliant	Yes
Reset Button	Yes
Brand	Alibi Vigilant
Warranty	3-Year
https://www.alibisecurity.com/media/docs/ali-pt80-vluzais-d-datasheet-as.pdf
https://www.alibisecurity.com/blog/post/alibi-product-matrix
https://www.alibisecurity.com/blog/post/alibi-vigilant-mobile-app
https://www.alibisecurity.com/blog/post/power-distance
https://www.alibisecurity.com/media/docs/ali-vig-ipc-usermanual-br.pdf
https://www.alibisecurity.com/media/docs/ip-camera-installation-guide.pdf
https://www.alibisecurity.com/blog/post/alibi-vigilant-camera-firmware','Alibi ALI-PT80-VLUZAIS-D 8MP 98 Feet IllumiNite-IR Starlight+','Alibi ALI-PT80-VLUZAIS-D 8MP 98 Feet IllumiNite-IR Starlight+. NDAA compliant. Authorized Alibi dealer, ships from New York.','alibi, ali-pt80-vluzais-d, starlight, ip camera, turret camera, ndaa','','ALI-PT80-VLUZAIS-D','8MP high-resolution 3840 x 2160 @ 30fps
2.8-12mm @ F1.2
111.5 to 54.1 degrees horizontal FOV to capture large areas
Smart IR up to 98 feet nighttime viewing
Color Attribute Collection
IntelliSearch Color Match Technology
Starlight+ technology - Color: 0.0005 Lux, 0 Lux with IR
130dB True Wide Dynamic Range (WDR)
Supports red & blue warning lights for Active Deterrence
Built-in mic and speaker
Audio I/O 1 in 1 out; Alarm 1 in/1 out
Micro SD, up to 512 GB
Supports Ultra 265, H.265, H.264, and MJPEG
ANR, NAS(NFS) Network Storage
IP67 weather-resistant rating
IK10 vandal resistant
NDAA Compliant
One-click Cloud firmware updating','[{"label": "NDAA", "detail": "NDAA Compliant - meets the product technical requirements of NDAA Section 889", "icon": "/media/p_f8cbae82-4349-48a6-83af-8cebe63cdd9a.png"}, {"label": "Starlight", "detail": "Starlight chipset with a super low light LUX rating", "icon": "/media/p_03ae7540-e2b2-4a7a-88cb-2d1ce56fae41.png"}, {"label": "Audio Mic", "detail": "Includes Built-in mic.", "icon": "/media/p_06f9cc60-9191-48c6-8bc9-95cf6fc8c7c1.png"}, {"label": "IP67", "detail": "IP67 Weather Rated Enclosure – Ideal for outdoor applications", "icon": "/media/p_1f4ccdb1-34be-4c19-9c10-39878257ce7d.png"}, {"label": "WDR", "detail": "Wide Dynamic Range – Gain better images in diverse lighting conditions", "icon": "/media/p_3b868fc0-904f-4642-bfcc-6944396dd866.png"}, {"label": "IK10", "detail": "IK10 rated vandalproof housing - resists impact effectively", "icon": "/media/p_34b15106-5e79-4128-8f1a-668de435eefb.png"}, {"label": "ONVIF", "detail": "ONVIF Certified", "icon": "/media/p_e020abd0-1488-40b5-b565-6e2dc8f15bff.png"}, {"label": "1-Click", "detail": "One-click Cloud firmware updating.", "icon": "/media/p_29411a7b-1eaa-476f-bb42-bc698fd2be7e.png"}]','',0);
INSERT OR IGNORE INTO product_images (product_slug,url,position) VALUES ('ali-pb81-vluai-d','/img/alibi/ali-pb81-vluai-d-1.jpg',0);
INSERT OR IGNORE INTO product_images (product_slug,url,position) VALUES ('ali-pb81-vluai-d','/img/alibi/ali-pb81-vluai-d-2.jpg',1);
INSERT OR IGNORE INTO product_images (product_slug,url,position) VALUES ('ali-pb81-vluai-d','/img/alibi/ali-pb81-vluai-d-3.jpg',2);
INSERT OR IGNORE INTO product_images (product_slug,url,position) VALUES ('ali-fd82-vua-d','/img/alibi/ali-fd82-vua-d-1.jpg',0);
INSERT OR IGNORE INTO product_images (product_slug,url,position) VALUES ('ali-fd82-vua-d','/img/alibi/ali-fd82-vua-d-2.jpg',1);
INSERT OR IGNORE INTO product_images (product_slug,url,position) VALUES ('ali-fd82-vua-d','/img/alibi/ali-fd82-vua-d-3.jpg',2);
INSERT OR IGNORE INTO product_images (product_slug,url,position) VALUES ('ali-fd82-vua-d','/img/alibi/ali-fd82-vua-d-4.jpg',3);
INSERT OR IGNORE INTO product_images (product_slug,url,position) VALUES ('ali-ft41-a-d','/img/alibi/ali-ft41-a-d-1.jpg',0);
INSERT OR IGNORE INTO product_images (product_slug,url,position) VALUES ('ali-ft41-a-d','/img/alibi/ali-ft41-a-d-2.jpg',1);
INSERT OR IGNORE INTO product_images (product_slug,url,position) VALUES ('ali-ft41-a-d','/img/alibi/ali-ft41-a-d-3.jpg',2);
INSERT OR IGNORE INTO product_images (product_slug,url,position) VALUES ('ali-ft41-a-d','/img/alibi/ali-ft41-a-d-4.jpg',3);
INSERT OR IGNORE INTO product_images (product_slug,url,position) VALUES ('ali-ft41-la-d','/img/alibi/ali-ft41-la-d-1.jpg',0);
INSERT OR IGNORE INTO product_images (product_slug,url,position) VALUES ('ali-ft41-la-d','/img/alibi/ali-ft41-la-d-2.jpg',1);
INSERT OR IGNORE INTO product_images (product_slug,url,position) VALUES ('ali-ft41-la-d','/img/alibi/ali-ft41-la-d-3.jpg',2);
INSERT OR IGNORE INTO product_images (product_slug,url,position) VALUES ('ali-ft41-la-d','/img/alibi/ali-ft41-la-d-4.jpg',3);
INSERT OR IGNORE INTO product_images (product_slug,url,position) VALUES ('ali-ft80-la-d','/img/alibi/ali-ft80-la-d-1.jpg',0);
INSERT OR IGNORE INTO product_images (product_slug,url,position) VALUES ('ali-ft80-la-d','/img/alibi/ali-ft80-la-d-2.jpg',1);
INSERT OR IGNORE INTO product_images (product_slug,url,position) VALUES ('ali-ft80-la-d','/img/alibi/ali-ft80-la-d-3.jpg',2);
INSERT OR IGNORE INTO product_images (product_slug,url,position) VALUES ('ali-ft80-la-d','/img/alibi/ali-ft80-la-d-4.jpg',3);
INSERT OR IGNORE INTO product_images (product_slug,url,position) VALUES ('ali-pt81-vluai-d','/img/alibi/ali-pt81-vluai-d-1.jpg',0);
INSERT OR IGNORE INTO product_images (product_slug,url,position) VALUES ('ali-pt81-vluai-d','/img/alibi/ali-pt81-vluai-d-2.jpg',1);
INSERT OR IGNORE INTO product_images (product_slug,url,position) VALUES ('ali-pt81-vluai-d','/img/alibi/ali-pt81-vluai-d-3.jpg',2);
INSERT OR IGNORE INTO product_images (product_slug,url,position) VALUES ('ali-pt81-vluai-d','/img/alibi/ali-pt81-vluai-d-4.jpg',3);
INSERT OR IGNORE INTO product_images (product_slug,url,position) VALUES ('ali-pt81-vluai-d','/img/alibi/ali-pt81-vluai-d-5.jpg',4);
INSERT OR IGNORE INTO product_images (product_slug,url,position) VALUES ('ali-nr043f-1-d','/img/alibi/ali-nr043f-1-d-1.jpg',0);
INSERT OR IGNORE INTO product_images (product_slug,url,position) VALUES ('ali-nr043f-1-d','/img/alibi/ali-nr043f-1-d-2.jpg',1);
INSERT OR IGNORE INTO product_images (product_slug,url,position) VALUES ('ali-nr043f-1-d','/img/alibi/ali-nr043f-1-d-3.jpg',2);
INSERT OR IGNORE INTO product_images (product_slug,url,position) VALUES ('ali-nr043f-1-d','/img/alibi/ali-nr043f-1-d-4.jpg',3);
INSERT OR IGNORE INTO product_images (product_slug,url,position) VALUES ('ali-nr043f-1-d','/img/alibi/ali-nr043f-1-d-5.jpg',4);
INSERT OR IGNORE INTO product_images (product_slug,url,position) VALUES ('ali-nr160pai-2-d','/img/alibi/ali-nr160pai-2-d-1.jpg',0);
INSERT OR IGNORE INTO product_images (product_slug,url,position) VALUES ('ali-nr160pai-2-d','/img/alibi/ali-nr160pai-2-d-2.jpg',1);
INSERT OR IGNORE INTO product_images (product_slug,url,position) VALUES ('ali-nr160pai-2-d','/img/alibi/ali-nr160pai-2-d-3.jpg',2);
INSERT OR IGNORE INTO product_images (product_slug,url,position) VALUES ('ali-nr160pai-2-d','/img/alibi/ali-nr160pai-2-d-4.jpg',3);
INSERT OR IGNORE INTO product_images (product_slug,url,position) VALUES ('ali-nr160pai-2-d','/img/alibi/ali-nr160pai-2-d-5.jpg',4);
INSERT OR IGNORE INTO product_images (product_slug,url,position) VALUES ('ali-pb50-luais-d','/img/alibi/ali-pb50-luais-d-1.jpg',0);
INSERT OR IGNORE INTO product_images (product_slug,url,position) VALUES ('ali-pb50-luais-d','/img/alibi/ali-pb50-luais-d-2.jpg',1);
INSERT OR IGNORE INTO product_images (product_slug,url,position) VALUES ('ali-pb50-luais-d','/img/alibi/ali-pb50-luais-d-3.jpg',2);
INSERT OR IGNORE INTO product_images (product_slug,url,position) VALUES ('ali-pb50-luais-d','/img/alibi/ali-pb50-luais-d-4.jpg',3);
INSERT OR IGNORE INTO product_images (product_slug,url,position) VALUES ('ali-pb50-luais-d','/img/alibi/ali-pb50-luais-d-5.jpg',4);
INSERT OR IGNORE INTO product_images (product_slug,url,position) VALUES ('ali-pb80-vluais-d','/img/alibi/ali-pb80-vluais-d-1.jpg',0);
INSERT OR IGNORE INTO product_images (product_slug,url,position) VALUES ('ali-pb80-vluais-d','/img/alibi/ali-pb80-vluais-d-2.jpg',1);
INSERT OR IGNORE INTO product_images (product_slug,url,position) VALUES ('ali-pb80-vluais-d','/img/alibi/ali-pb80-vluais-d-3.jpg',2);
INSERT OR IGNORE INTO product_images (product_slug,url,position) VALUES ('ali-pm80-vluai-d','/img/alibi/ali-pm80-vluai-d-1.jpg',0);
INSERT OR IGNORE INTO product_images (product_slug,url,position) VALUES ('ali-pm80-vluai-d','/img/alibi/ali-pm80-vluai-d-2.jpg',1);
INSERT OR IGNORE INTO product_images (product_slug,url,position) VALUES ('ali-pm80-vluai-d','/img/alibi/ali-pm80-vluai-d-3.jpg',2);
INSERT OR IGNORE INTO product_images (product_slug,url,position) VALUES ('ali-pm80-vluai-d','/img/alibi/ali-pm80-vluai-d-4.jpg',3);
INSERT OR IGNORE INTO product_images (product_slug,url,position) VALUES ('ali-pt40-vluais-d','/img/alibi/ali-pt40-vluais-d-1.jpg',0);
INSERT OR IGNORE INTO product_images (product_slug,url,position) VALUES ('ali-pt40-vluais-d','/img/alibi/ali-pt40-vluais-d-2.jpg',1);
INSERT OR IGNORE INTO product_images (product_slug,url,position) VALUES ('ali-pt40-vluais-d','/img/alibi/ali-pt40-vluais-d-3.jpg',2);
INSERT OR IGNORE INTO product_images (product_slug,url,position) VALUES ('ali-pt40-vluais-d','/img/alibi/ali-pt40-vluais-d-4.jpg',3);
INSERT OR IGNORE INTO product_images (product_slug,url,position) VALUES ('ali-pt80-vluais-d','/img/alibi/ali-pt80-vluais-d-1.jpg',0);
INSERT OR IGNORE INTO product_images (product_slug,url,position) VALUES ('ali-pt80-vluais-d','/img/alibi/ali-pt80-vluais-d-2.jpg',1);
INSERT OR IGNORE INTO product_images (product_slug,url,position) VALUES ('ali-pt80-vluais-d','/img/alibi/ali-pt80-vluais-d-3.jpg',2);
INSERT OR IGNORE INTO product_images (product_slug,url,position) VALUES ('ali-pt80-vluais-d','/img/alibi/ali-pt80-vluais-d-4.jpg',3);
INSERT OR IGNORE INTO product_images (product_slug,url,position) VALUES ('ali-pt80-uai-d','/img/alibi/ali-pt80-uai-d-1.jpg',0);
INSERT OR IGNORE INTO product_images (product_slug,url,position) VALUES ('ali-pt80-uai-d','/img/alibi/ali-pt80-uai-d-2.jpg',1);
INSERT OR IGNORE INTO product_images (product_slug,url,position) VALUES ('ali-pt80-uai-d','/img/alibi/ali-pt80-uai-d-3.jpg',2);
INSERT OR IGNORE INTO product_images (product_slug,url,position) VALUES ('ali-pt80-uai-d','/img/alibi/ali-pt80-uai-d-4.jpg',3);
INSERT OR IGNORE INTO product_images (product_slug,url,position) VALUES ('ali-pt80-uai-d','/img/alibi/ali-pt80-uai-d-5.jpg',4);
INSERT OR IGNORE INTO product_images (product_slug,url,position) VALUES ('ali-pt80-vluzais-d','/img/alibi/ali-pt80-vluzais-d-1.jpg',0);
INSERT OR IGNORE INTO product_images (product_slug,url,position) VALUES ('ali-pt80-vluzais-d','/img/alibi/ali-pt80-vluzais-d-2.jpg',1);
INSERT OR IGNORE INTO product_images (product_slug,url,position) VALUES ('ali-pt80-vluzais-d','/img/alibi/ali-pt80-vluzais-d-3.jpg',2);
INSERT OR IGNORE INTO product_images (product_slug,url,position) VALUES ('ali-pt80-vluzais-d','/img/alibi/ali-pt80-vluzais-d-4.jpg',3);
INSERT OR REPLACE INTO product_redirects (old_slug, to_path, reason) SELECT 'ali-fb40-a-d', '/p/ali-fb41-a-d', 'replaced by Alibi 2026-11-24' WHERE EXISTS (SELECT 1 FROM products WHERE slug = 'ali-fb41-a-d' AND active = 1);
UPDATE products SET active = 0, featured = 0 WHERE slug = 'ali-fb40-a-d' AND EXISTS (SELECT 1 FROM products WHERE slug = 'ali-fb41-a-d' AND active = 1);
INSERT OR REPLACE INTO product_redirects (old_slug, to_path, reason) SELECT 'ali-fb41-ua-d', '/p/ali-fb41-lua-d', 'replaced by Alibi 2026-11-24' WHERE EXISTS (SELECT 1 FROM products WHERE slug = 'ali-fb41-lua-d' AND active = 1);
UPDATE products SET active = 0, featured = 0 WHERE slug = 'ali-fb41-ua-d' AND EXISTS (SELECT 1 FROM products WHERE slug = 'ali-fb41-lua-d' AND active = 1);
INSERT OR REPLACE INTO product_redirects (old_slug, to_path, reason) SELECT 'ali-fb80-a-d', '/p/ali-fb80-la-d', 'replaced by Alibi 2026-11-24' WHERE EXISTS (SELECT 1 FROM products WHERE slug = 'ali-fb80-la-d' AND active = 1);
UPDATE products SET active = 0, featured = 0 WHERE slug = 'ali-fb80-a-d' AND EXISTS (SELECT 1 FROM products WHERE slug = 'ali-fb80-la-d' AND active = 1);
INSERT OR REPLACE INTO product_redirects (old_slug, to_path, reason) SELECT 'ali-fb80-lua-d', '/p/ali-pb81-vluai-d', 'replaced by Alibi 2026-11-24' WHERE EXISTS (SELECT 1 FROM products WHERE slug = 'ali-pb81-vluai-d' AND active = 1);
UPDATE products SET active = 0, featured = 0 WHERE slug = 'ali-fb80-lua-d' AND EXISTS (SELECT 1 FROM products WHERE slug = 'ali-pb81-vluai-d' AND active = 1);
INSERT OR REPLACE INTO product_redirects (old_slug, to_path, reason) SELECT 'ali-fb81-ua-d', '/p/ali-fb81-lua-d', 'replaced by Alibi 2026-11-24' WHERE EXISTS (SELECT 1 FROM products WHERE slug = 'ali-fb81-lua-d' AND active = 1);
UPDATE products SET active = 0, featured = 0 WHERE slug = 'ali-fb81-ua-d' AND EXISTS (SELECT 1 FROM products WHERE slug = 'ali-fb81-lua-d' AND active = 1);
INSERT OR REPLACE INTO product_redirects (old_slug, to_path, reason) SELECT 'ali-fd41-v-d', '/p/ali-fd41-va-d', 'replaced by Alibi 2026-11-24' WHERE EXISTS (SELECT 1 FROM products WHERE slug = 'ali-fd41-va-d' AND active = 1);
UPDATE products SET active = 0, featured = 0 WHERE slug = 'ali-fd41-v-d' AND EXISTS (SELECT 1 FROM products WHERE slug = 'ali-fd41-va-d' AND active = 1);
INSERT OR REPLACE INTO product_redirects (old_slug, to_path, reason) SELECT 'ali-fd81-vua-d', '/p/ali-fd82-vua-d', 'replaced by Alibi 2026-11-24' WHERE EXISTS (SELECT 1 FROM products WHERE slug = 'ali-fd82-vua-d' AND active = 1);
UPDATE products SET active = 0, featured = 0 WHERE slug = 'ali-fd81-vua-d' AND EXISTS (SELECT 1 FROM products WHERE slug = 'ali-fd82-vua-d' AND active = 1);
INSERT OR REPLACE INTO product_redirects (old_slug, to_path, reason) SELECT 'ali-ft40-a-d', '/p/ali-ft41-a-d', 'replaced by Alibi 2026-11-24' WHERE EXISTS (SELECT 1 FROM products WHERE slug = 'ali-ft41-a-d' AND active = 1);
UPDATE products SET active = 0, featured = 0 WHERE slug = 'ali-ft40-a-d' AND EXISTS (SELECT 1 FROM products WHERE slug = 'ali-ft41-a-d' AND active = 1);
INSERT OR REPLACE INTO product_redirects (old_slug, to_path, reason) SELECT 'ali-ft41-lua-d', '/p/ali-ft41-la-d', 'replaced by Alibi 2026-11-24' WHERE EXISTS (SELECT 1 FROM products WHERE slug = 'ali-ft41-la-d' AND active = 1);
UPDATE products SET active = 0, featured = 0 WHERE slug = 'ali-ft41-lua-d' AND EXISTS (SELECT 1 FROM products WHERE slug = 'ali-ft41-la-d' AND active = 1);
INSERT OR REPLACE INTO product_redirects (old_slug, to_path, reason) SELECT 'ali-ft41-ua-d', '/p/ali-ft41-la-d', 'replaced by Alibi 2026-11-24' WHERE EXISTS (SELECT 1 FROM products WHERE slug = 'ali-ft41-la-d' AND active = 1);
UPDATE products SET active = 0, featured = 0 WHERE slug = 'ali-ft41-ua-d' AND EXISTS (SELECT 1 FROM products WHERE slug = 'ali-ft41-la-d' AND active = 1);
INSERT OR REPLACE INTO product_redirects (old_slug, to_path, reason) SELECT 'ali-ft80-a-d', '/p/ali-ft80-la-d', 'replaced by Alibi 2026-11-24' WHERE EXISTS (SELECT 1 FROM products WHERE slug = 'ali-ft80-la-d' AND active = 1);
UPDATE products SET active = 0, featured = 0 WHERE slug = 'ali-ft80-a-d' AND EXISTS (SELECT 1 FROM products WHERE slug = 'ali-ft80-la-d' AND active = 1);
INSERT OR REPLACE INTO product_redirects (old_slug, to_path, reason) SELECT 'ali-ft80-lua-d', '/p/ali-pt81-vluai-d', 'replaced by Alibi 2026-11-24' WHERE EXISTS (SELECT 1 FROM products WHERE slug = 'ali-pt81-vluai-d' AND active = 1);
UPDATE products SET active = 0, featured = 0 WHERE slug = 'ali-ft80-lua-d' AND EXISTS (SELECT 1 FROM products WHERE slug = 'ali-pt81-vluai-d' AND active = 1);
INSERT OR REPLACE INTO product_redirects (old_slug, to_path, reason) SELECT 'ali-ft81-ua-d', '/p/ali-ft81-lua-d', 'replaced by Alibi 2026-11-24' WHERE EXISTS (SELECT 1 FROM products WHERE slug = 'ali-ft81-lua-d' AND active = 1);
UPDATE products SET active = 0, featured = 0 WHERE slug = 'ali-ft81-ua-d' AND EXISTS (SELECT 1 FROM products WHERE slug = 'ali-ft81-lua-d' AND active = 1);
INSERT OR REPLACE INTO product_redirects (old_slug, to_path, reason) SELECT 'ali-nr042f-1-d', '/p/ali-nr043f-1-d', 'replaced by Alibi 2026-11-24' WHERE EXISTS (SELECT 1 FROM products WHERE slug = 'ali-nr043f-1-d' AND active = 1);
UPDATE products SET active = 0, featured = 0 WHERE slug = 'ali-nr042f-1-d' AND EXISTS (SELECT 1 FROM products WHERE slug = 'ali-nr043f-1-d' AND active = 1);
INSERT OR REPLACE INTO product_redirects (old_slug, to_path, reason) SELECT 'ali-nr162p-4-d', '/p/ali-nr160pai-2-d', 'replaced by Alibi 2026-11-24' WHERE EXISTS (SELECT 1 FROM products WHERE slug = 'ali-nr160pai-2-d' AND active = 1);
UPDATE products SET active = 0, featured = 0 WHERE slug = 'ali-nr162p-4-d' AND EXISTS (SELECT 1 FROM products WHERE slug = 'ali-nr160pai-2-d' AND active = 1);
INSERT OR REPLACE INTO product_redirects (old_slug, to_path, reason) SELECT 'ali-pb40-uai-d', '/p/ali-fb41-lua-d', 'replaced by Alibi 2026-11-24' WHERE EXISTS (SELECT 1 FROM products WHERE slug = 'ali-fb41-lua-d' AND active = 1);
UPDATE products SET active = 0, featured = 0 WHERE slug = 'ali-pb40-uai-d' AND EXISTS (SELECT 1 FROM products WHERE slug = 'ali-fb41-lua-d' AND active = 1);
INSERT OR REPLACE INTO product_redirects (old_slug, to_path, reason) SELECT 'ali-pb40-uais-d', '/p/ali-pb50-luais-d', 'replaced by Alibi 2026-11-24' WHERE EXISTS (SELECT 1 FROM products WHERE slug = 'ali-pb50-luais-d' AND active = 1);
UPDATE products SET active = 0, featured = 0 WHERE slug = 'ali-pb40-uais-d' AND EXISTS (SELECT 1 FROM products WHERE slug = 'ali-pb50-luais-d' AND active = 1);
INSERT OR REPLACE INTO product_redirects (old_slug, to_path, reason) SELECT 'ali-pb41-uai-d', '/p/ali-pb50-luais-d', 'replaced by Alibi 2026-11-24' WHERE EXISTS (SELECT 1 FROM products WHERE slug = 'ali-pb50-luais-d' AND active = 1);
UPDATE products SET active = 0, featured = 0 WHERE slug = 'ali-pb41-uai-d' AND EXISTS (SELECT 1 FROM products WHERE slug = 'ali-pb50-luais-d' AND active = 1);
INSERT OR REPLACE INTO product_redirects (old_slug, to_path, reason) SELECT 'ali-pb51-uzai-d', '/p/ali-pb40-vluzais-d', 'replaced by Alibi 2026-11-24' WHERE EXISTS (SELECT 1 FROM products WHERE slug = 'ali-pb40-vluzais-d' AND active = 1);
UPDATE products SET active = 0, featured = 0 WHERE slug = 'ali-pb51-uzai-d' AND EXISTS (SELECT 1 FROM products WHERE slug = 'ali-pb40-vluzais-d' AND active = 1);
INSERT OR REPLACE INTO product_redirects (old_slug, to_path, reason) SELECT 'ali-pb80-vluai-d', '/p/ali-pb80-vluais-d', 'replaced by Alibi 2026-11-24' WHERE EXISTS (SELECT 1 FROM products WHERE slug = 'ali-pb80-vluais-d' AND active = 1);
UPDATE products SET active = 0, featured = 0 WHERE slug = 'ali-pb80-vluai-d' AND EXISTS (SELECT 1 FROM products WHERE slug = 'ali-pb80-vluais-d' AND active = 1);
INSERT OR REPLACE INTO product_redirects (old_slug, to_path, reason) SELECT 'ali-pb81-ai-d', '/p/ali-pb80-vluais-d', 'replaced by Alibi 2026-11-24' WHERE EXISTS (SELECT 1 FROM products WHERE slug = 'ali-pb80-vluais-d' AND active = 1);
UPDATE products SET active = 0, featured = 0 WHERE slug = 'ali-pb81-ai-d' AND EXISTS (SELECT 1 FROM products WHERE slug = 'ali-pb80-vluais-d' AND active = 1);
INSERT OR REPLACE INTO product_redirects (old_slug, to_path, reason) SELECT 'ali-pm41-vai-d', '/p/ali-pm40-vluai-d', 'replaced by Alibi 2026-11-24' WHERE EXISTS (SELECT 1 FROM products WHERE slug = 'ali-pm40-vluai-d' AND active = 1);
UPDATE products SET active = 0, featured = 0 WHERE slug = 'ali-pm41-vai-d' AND EXISTS (SELECT 1 FROM products WHERE slug = 'ali-pm40-vluai-d' AND active = 1);
INSERT OR REPLACE INTO product_redirects (old_slug, to_path, reason) SELECT 'ali-pm80-vua-d', '/p/ali-pm80-vluai-d', 'replaced by Alibi 2026-11-24' WHERE EXISTS (SELECT 1 FROM products WHERE slug = 'ali-pm80-vluai-d' AND active = 1);
UPDATE products SET active = 0, featured = 0 WHERE slug = 'ali-pm80-vua-d' AND EXISTS (SELECT 1 FROM products WHERE slug = 'ali-pm80-vluai-d' AND active = 1);
INSERT OR REPLACE INTO product_redirects (old_slug, to_path, reason) SELECT 'ali-pt40-uai-d', '/p/ali-ft41-la-d', 'replaced by Alibi 2026-11-24' WHERE EXISTS (SELECT 1 FROM products WHERE slug = 'ali-ft41-la-d' AND active = 1);
UPDATE products SET active = 0, featured = 0 WHERE slug = 'ali-pt40-uai-d' AND EXISTS (SELECT 1 FROM products WHERE slug = 'ali-ft41-la-d' AND active = 1);
INSERT OR REPLACE INTO product_redirects (old_slug, to_path, reason) SELECT 'ali-pt40-uais-d', '/p/ali-pt40-vluais-d', 'replaced by Alibi 2026-11-24' WHERE EXISTS (SELECT 1 FROM products WHERE slug = 'ali-pt40-vluais-d' AND active = 1);
UPDATE products SET active = 0, featured = 0 WHERE slug = 'ali-pt40-uais-d' AND EXISTS (SELECT 1 FROM products WHERE slug = 'ali-pt40-vluais-d' AND active = 1);
INSERT OR REPLACE INTO product_redirects (old_slug, to_path, reason) SELECT 'ali-pt40-vluai-d', '/p/ali-pt40-vluais-d', 'replaced by Alibi 2026-11-24' WHERE EXISTS (SELECT 1 FROM products WHERE slug = 'ali-pt40-vluais-d' AND active = 1);
UPDATE products SET active = 0, featured = 0 WHERE slug = 'ali-pt40-vluai-d' AND EXISTS (SELECT 1 FROM products WHERE slug = 'ali-pt40-vluais-d' AND active = 1);
INSERT OR REPLACE INTO product_redirects (old_slug, to_path, reason) SELECT 'ali-pt50-luai-d', '/p/ali-pt40-vluais-d', 'replaced by Alibi 2026-11-24' WHERE EXISTS (SELECT 1 FROM products WHERE slug = 'ali-pt40-vluais-d' AND active = 1);
UPDATE products SET active = 0, featured = 0 WHERE slug = 'ali-pt50-luai-d' AND EXISTS (SELECT 1 FROM products WHERE slug = 'ali-pt40-vluais-d' AND active = 1);
INSERT OR REPLACE INTO product_redirects (old_slug, to_path, reason) SELECT 'ali-pt50-luais-d', '/p/ali-pt40-vluais-d', 'replaced by Alibi 2026-11-24' WHERE EXISTS (SELECT 1 FROM products WHERE slug = 'ali-pt40-vluais-d' AND active = 1);
UPDATE products SET active = 0, featured = 0 WHERE slug = 'ali-pt50-luais-d' AND EXISTS (SELECT 1 FROM products WHERE slug = 'ali-pt40-vluais-d' AND active = 1);
INSERT OR REPLACE INTO product_redirects (old_slug, to_path, reason) SELECT 'ali-pt51-uzai-d', '/p/ali-pt40-vluzais-d', 'replaced by Alibi 2026-11-24' WHERE EXISTS (SELECT 1 FROM products WHERE slug = 'ali-pt40-vluzais-d' AND active = 1);
UPDATE products SET active = 0, featured = 0 WHERE slug = 'ali-pt51-uzai-d' AND EXISTS (SELECT 1 FROM products WHERE slug = 'ali-pt40-vluzais-d' AND active = 1);
INSERT OR REPLACE INTO product_redirects (old_slug, to_path, reason) SELECT 'ali-pt80-luais-d', '/p/ali-pt80-vluais-d', 'replaced by Alibi 2026-11-24' WHERE EXISTS (SELECT 1 FROM products WHERE slug = 'ali-pt80-vluais-d' AND active = 1);
UPDATE products SET active = 0, featured = 0 WHERE slug = 'ali-pt80-luais-d' AND EXISTS (SELECT 1 FROM products WHERE slug = 'ali-pt80-vluais-d' AND active = 1);
INSERT OR REPLACE INTO product_redirects (old_slug, to_path, reason) SELECT 'ali-pt81-ai-d', '/p/ali-pt80-uai-d', 'replaced by Alibi 2026-11-24' WHERE EXISTS (SELECT 1 FROM products WHERE slug = 'ali-pt80-uai-d' AND active = 1);
UPDATE products SET active = 0, featured = 0 WHERE slug = 'ali-pt81-ai-d' AND EXISTS (SELECT 1 FROM products WHERE slug = 'ali-pt80-uai-d' AND active = 1);
INSERT OR REPLACE INTO product_redirects (old_slug, to_path, reason) SELECT 'ali-xb20-vuzai-anpr-d', '/p/ali-xb40-vuzai-anpr-d', 'replaced by Alibi 2026-11-24' WHERE EXISTS (SELECT 1 FROM products WHERE slug = 'ali-xb40-vuzai-anpr-d' AND active = 1);
UPDATE products SET active = 0, featured = 0 WHERE slug = 'ali-xb20-vuzai-anpr-d' AND EXISTS (SELECT 1 FROM products WHERE slug = 'ali-xb40-vuzai-anpr-d' AND active = 1);
INSERT OR REPLACE INTO product_redirects (old_slug, to_path, reason) SELECT 'ali-xb81-uzai-d', '/p/ali-pb80-vluzais-d', 'replaced by Alibi 2026-11-24' WHERE EXISTS (SELECT 1 FROM products WHERE slug = 'ali-pb80-vluzais-d' AND active = 1);
UPDATE products SET active = 0, featured = 0 WHERE slug = 'ali-xb81-uzai-d' AND EXISTS (SELECT 1 FROM products WHERE slug = 'ali-pb80-vluzais-d' AND active = 1);
INSERT OR REPLACE INTO product_redirects (old_slug, to_path, reason) SELECT 'ali-xt81-uzai-d', '/p/ali-pt80-vluzais-d', 'replaced by Alibi 2026-11-24' WHERE EXISTS (SELECT 1 FROM products WHERE slug = 'ali-pt80-vluzais-d' AND active = 1);
UPDATE products SET active = 0, featured = 0 WHERE slug = 'ali-xt81-uzai-d' AND EXISTS (SELECT 1 FROM products WHERE slug = 'ali-pt80-vluzais-d' AND active = 1);
