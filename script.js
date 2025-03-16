// DOM Elements
const cameraPreview = document.getElementById('camera-preview');
const captureCanvas = document.getElementById('capture-canvas');
const captureBtn = document.getElementById('capture-btn');
const cancelBtn = document.getElementById('cancel-btn');
const saveBtn = document.getElementById('save-btn');
const flashToggle = document.getElementById('flash-toggle');
const modeToggle = document.getElementById('mode-toggle');
const cameraSwitchBtn = document.getElementById('camera-switch');
const galleryBtn = document.getElementById('gallery-btn');
const noPreview = document.querySelector('.no-preview');
const capturedImageContainer = document.querySelector('.captured-image-container');
const capturedImage = document.getElementById('captured-image');
const pdfPreviewModal = document.getElementById('pdf-preview-modal');
const closeModalBtn = document.getElementById('close-modal-btn');
const pdfIframe = document.getElementById('pdf-iframe');
const downloadPdfBtn = document.getElementById('download-pdf-btn');
const scanOverlay = document.getElementById('scan-overlay');

// DOM Elements - Top Feature Buttons
const flashBtn = document.getElementById('flash-btn');
const hdBtn = document.getElementById('hd-btn');
const filterBtn = document.getElementById('filter-btn');
const gridBtn = document.getElementById('grid-btn');
const settingsBtn = document.getElementById('settings-btn');

// DOM Elements - Bottom Mode Buttons
const bookModeBtn = document.getElementById('book-mode');
const textModeBtn = document.getElementById('text-mode');
const docsModeBtn = document.getElementById('docs-mode');
const idCardModeBtn = document.getElementById('idcard-mode');
const qrCodeModeBtn = document.getElementById('qrcode-mode');
const importModeBtn = document.getElementById('import-mode');

// DOM Elements - Grid and Modals
const gridOverlay = document.getElementById('grid-overlay');
const filterModal = document.getElementById('filter-modal');
const closeFilterModalBtn = document.getElementById('close-filter-modal-btn');
const settingsModal = document.getElementById('settings-modal');
const closeSettingsModalBtn = document.getElementById('close-settings-modal-btn');
const filterOptions = document.querySelectorAll('.filter-option');

// DOM Elements - Settings
const qualitySetting = document.getElementById('quality-setting');
const formatSetting = document.getElementById('format-setting');
const autoEnhanceToggle = document.getElementById('auto-enhance-toggle');
const darkModeToggle = document.getElementById('dark-mode-toggle');

// Permission Elements
const permissionContainer = document.getElementById('permission-container');
const permissionBtn = document.getElementById('permission-btn');

// Signature Elements
const addSignatureBtn = document.getElementById('add-signature-btn');
const signatureModal = document.getElementById('signature-modal');
const signatureCanvas = document.getElementById('signature-canvas');
const clearSignatureBtn = document.getElementById('clear-signature-btn');
const closeSignatureModalBtn = document.getElementById('close-signature-modal-btn');
const applySignatureBtn = document.getElementById('apply-signature-btn');
const cancelSignatureBtn = document.getElementById('cancel-signature-btn');
const colorBtns = document.querySelectorAll('.color-btn');
const importSignatureBtn = document.getElementById('import-signature-btn');

// DOM Elements for signature width
const signatureWidth = document.getElementById('signature-width');

// PDF Control Elements
const zoomInBtn = document.getElementById('zoom-in-btn');
const zoomOutBtn = document.getElementById('zoom-out-btn');
const rotateBtn = document.getElementById('rotate-btn');

// Signature Filter Elements
const normalFilterBtn = document.getElementById('normal-filter');
const bwFilterBtn = document.getElementById('bw-filter');
const contrastFilterBtn = document.getElementById('contrast-filter');
const invertFilterBtn = document.getElementById('invert-filter');

// Global variables
let stream = null;
let hasFlash = false;
let flashOn = false;
let isDarkMode = true;
let capturedImages = [];
let currentPdfBlob = null;
let isScanning = false;

// New global variables
let hdMode = false;
let gridVisible = false;
let currentMode = 'docs'; // Default mode
let currentFilter = 'normal';
let scanQuality = 'medium'; // 'low', 'medium', 'high'
let pdfFormat = 'a4'; // 'a4', 'letter', 'auto'
let autoEnhance = true;

// Global variable to store available cameras
let availableCameras = [];
let currentCameraIndex = 0;

// Global variables for signature
let signatureCtx;
let isDrawing = false;
let lastX = 0;
let lastY = 0;
let signatureColor = '#000000';
let hasSignature = false;
let signatureImage = null;
let signatureScale = 30; // Default scale percentage
let currentSignatureFilter = 'normal'; // Default filter

// PDF viewer settings
let pdfScale = 1;
let pdfRotation = 0;

// Global variables for signature positioning
let signaturePosition = { x: 0, y: 0 };
let signatureDragging = false;
let signatureResizing = false;
let signatureElement = null;
let initialMousePos = { x: 0, y: 0 };
let initialSignatureSize = { width: 0, height: 0 };

// Initialize the app
function initApp() {
    // Event listeners
    captureBtn.addEventListener('click', handleCaptureClick);
    cancelBtn.addEventListener('click', cancelCapture);
    saveBtn.addEventListener('click', saveCapture);
    flashToggle.addEventListener('click', toggleFlash);
    modeToggle.addEventListener('click', toggleMode);
    cameraSwitchBtn.addEventListener('click', switchCamera);
    galleryBtn.addEventListener('click', openGallery);
    closeModalBtn.addEventListener('click', closeModal);
    downloadPdfBtn.addEventListener('click', downloadPdf);

    // Event listeners for top feature buttons
    flashBtn.addEventListener('click', handleFlashBtn);
    hdBtn.addEventListener('click', toggleHDMode);
    filterBtn.addEventListener('click', openFilterModal);
    gridBtn.addEventListener('click', toggleGrid);
    settingsBtn.addEventListener('click', openSettingsModal);

    // Event listeners for bottom mode buttons
    bookModeBtn.addEventListener('click', () => switchMode('book'));
    textModeBtn.addEventListener('click', () => switchMode('text'));
    docsModeBtn.addEventListener('click', () => switchMode('docs'));
    idCardModeBtn.addEventListener('click', () => switchMode('idcard'));
    qrCodeModeBtn.addEventListener('click', () => switchMode('qrcode'));
    importModeBtn.addEventListener('click', () => switchMode('import'));

    // Event listeners for modal close buttons
    closeFilterModalBtn.addEventListener('click', closeFilterModal);
    closeSettingsModalBtn.addEventListener('click', closeSettingsModal);

    // Event listeners for filter options
    filterOptions.forEach(option => {
        option.addEventListener('click', () => {
            const filter = option.getAttribute('data-filter');
            applyFilter(filter);
            closeFilterModal();
        });
    });

    // Event listeners for settings
    qualitySetting.addEventListener('change', updateQualitySetting);
    formatSetting.addEventListener('change', updateFormatSetting);
    autoEnhanceToggle.addEventListener('change', updateAutoEnhance);
    darkModeToggle.addEventListener('change', updateDarkModeSetting);

    // Set initial active mode
    docsModeBtn.classList.add('active');

    // Add visual feedback for button press
    addButtonFeedback();

    // File input for gallery
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/*';
    fileInput.multiple = true;
    fileInput.style.display = 'none';
    document.body.appendChild(fileInput);
    
    fileInput.addEventListener('change', handleFileSelect);
    
    galleryBtn.addEventListener('click', () => {
        fileInput.click();
    });

    // Additional file input for import button
    const importInput = document.createElement('input');
    importInput.type = 'file';
    importInput.accept = 'image/*';
    importInput.multiple = true;
    importInput.style.display = 'none';
    document.body.appendChild(importInput);
    
    importInput.addEventListener('change', handleFileSelect);
    
    importModeBtn.addEventListener('click', () => {
        importInput.click();
    });

    // Permission button event listener
    permissionBtn.addEventListener('click', handlePermissionRequest);

    // Add camera device list refresh
    navigator.mediaDevices.addEventListener('devicechange', () => {
        if (stream) {
            console.log('कैमरा डिवाइस परिवर्तन का पता चला, डिवाइस सूची अपडेट हो रही है...');
            updateCameraDeviceList();
        }
    });
    
    // Initially check for available cameras
    updateCameraDeviceList().then(() => {
        console.log('प्रारंभिक कैमरा डिवाइस चेक पूरा हुआ');
    }).catch(error => {
        console.error('प्रारंभिक कैमरा डिवाइस चेक में त्रुटि:', error);
    });

    // Event listeners for signature
    addSignatureBtn.addEventListener('click', openSignatureModal);
    clearSignatureBtn.addEventListener('click', clearSignature);
    closeSignatureModalBtn.addEventListener('click', closeSignatureModal);
    applySignatureBtn.addEventListener('click', applySignature);
    cancelSignatureBtn.addEventListener('click', closeSignatureModal);
    importSignatureBtn.addEventListener('click', importSignature);
    
    // Event listeners for color picker
    colorBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Remove active class from all color buttons
            colorBtns.forEach(b => b.classList.remove('active'));
            // Add active class to clicked button
            btn.classList.add('active');
            // Set signature color
            signatureColor = btn.getAttribute('data-color');
        });
    });

    // Event listener for signature width
    signatureWidth.addEventListener('input', updateSignatureWidth);
    
    // Add event listeners for signature filters
    normalFilterBtn.addEventListener('click', () => applySignatureFilter('normal'));
    bwFilterBtn.addEventListener('click', () => applySignatureFilter('bw'));
    contrastFilterBtn.addEventListener('click', () => applySignatureFilter('contrast'));
    invertFilterBtn.addEventListener('click', () => applySignatureFilter('invert'));
    
    // Event listeners for PDF controls
    zoomInBtn.addEventListener('click', zoomInPdf);
    zoomOutBtn.addEventListener('click', zoomOutPdf);
    rotateBtn.addEventListener('click', rotatePdf);
}

// Add visual feedback for button press
function addButtonFeedback() {
    const allButtons = document.querySelectorAll('button');
    allButtons.forEach(button => {
        button.addEventListener('mousedown', () => {
            button.style.transform = 'scale(0.95)';
        });
        
        button.addEventListener('mouseup', () => {
            button.style.transform = '';
        });
        
        button.addEventListener('mouseleave', () => {
            button.style.transform = '';
        });
    });
}

// Handle capture button click
async function handleCaptureClick() {
    // If camera is not active, start it
    if (!stream) {
        await startCamera();
        return;
    }
    
    // Show scanning effect
    showScanningEffect();
    
    // If camera is active, take a picture
    setTimeout(() => {
        takePicture();
    }, 500);
}

// Show scanning effect
function showScanningEffect() {
    if (isScanning) return;
    
    isScanning = true;
    scanOverlay.style.display = 'block';
    
    // Hide scanning effect after animation
    setTimeout(() => {
        scanOverlay.style.display = 'none';
        isScanning = false;
    }, 1000);
}

// Start the camera
async function startCamera() {
    try {
        // Explicitly request camera permission before starting
        await requestCameraPermission();
        
        // First get list of available video devices (cameras)
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = devices.filter(device => device.kind === 'videoinput');
        
        // Update global camera list
        availableCameras = videoDevices;
        currentCameraIndex = 0;
        
        // Update camera switch button visibility
        cameraSwitchBtn.style.display = availableCameras.length > 1 ? 'flex' : 'none';
        
        // Log available cameras for debugging
        console.log('उपलब्ध कैमरा डिवाइस:', videoDevices);
        
        // Default constraints with no specific camera selected
        const constraints = {
            video: {
                // Remove facingMode to not restrict to the rear camera
                // facingMode: 'environment',
                width: hdMode ? { ideal: 3840 } : { ideal: 1920 },
                height: hdMode ? { ideal: 2160 } : { ideal: 1080 }
            }
        };
        
        // If external cameras are available (more than 1 camera), try to use one
        if (videoDevices.length > 1) {
            try {
                showNotification('External कैमरा कनेक्ट करने का प्रयास...');
                
                // Try to use the last device in the list (often an external camera)
                // You can change this logic if needed
                const externalCamera = videoDevices[videoDevices.length - 1];
                
                constraints.video.deviceId = { exact: externalCamera.deviceId };
                console.log('External कैमरा का उपयोग करने का प्रयास:', externalCamera.label);
                
                stream = await navigator.mediaDevices.getUserMedia(constraints);
            } catch (error) {
                console.error('External कैमरा उपयोग में विफल:', error);
                
                // If external camera fails, fall back to default camera
                delete constraints.video.deviceId;
                constraints.video.facingMode = 'environment'; // Default back to environment facing
                
                showNotification('डिफॉल्ट कैमरा का उपयोग करना', 'info');
                stream = await navigator.mediaDevices.getUserMedia(constraints);
            }
        } else {
            // Only one camera available, use default camera
            stream = await navigator.mediaDevices.getUserMedia(constraints);
        }
        
        cameraPreview.srcObject = stream;
        
        // Show camera preview and hide no-preview message
        cameraPreview.style.display = 'block';
        noPreview.style.display = 'none';
        
        // Add subtle animation to capture button to draw attention
        captureBtn.classList.add('pulse-animation');
        
        // Check if flash is available
        checkFlashAvailability();
        
        // Apply current filter
        applyFilter(currentFilter);
        
        // Show grid if enabled
        if (gridVisible) {
            gridOverlay.style.display = 'block';
        }
        
        // Update HD indicator
        updateHDIndicator();
        
        // Show camera info
        const videoTrack = stream.getVideoTracks()[0];
        if (videoTrack) {
            console.log('कैमरा सेटिंग्स:', videoTrack.getSettings());
            console.log('कैमरा कैपेबिलिटीज:', videoTrack.getCapabilities());
            
            const label = videoTrack.label || 'डिफॉल्ट कैमरा';
            showNotification(`कैमरा कनेक्टेड: ${label}`, 'success');
        }
        
    } catch (error) {
        console.error('Error accessing camera:', error);
        showNotification('कैमरा एक्सेस करने में समस्या हुई। कृपया अनुमति दें और पुन: प्रयास करें।', 'error');
    }
}

// Check if flash is available
function checkFlashAvailability() {
    if (stream && stream.getVideoTracks().length > 0) {
        const track = stream.getVideoTracks()[0];
        
        // Check if torch (flash) is supported
        if ('ImageCapture' in window) {
            const imageCapture = new ImageCapture(track);
            imageCapture.getPhotoCapabilities()
                .then(capabilities => {
                    hasFlash = !!capabilities.torch;
                    flashToggle.style.display = hasFlash ? 'flex' : 'none';
                    flashBtn.style.opacity = hasFlash ? '1' : '0.5';
                })
                .catch(error => {
                    console.error('Error checking flash capabilities:', error);
                    flashToggle.style.display = 'none';
                    flashBtn.style.opacity = '0.5';
                });
        } else {
            flashToggle.style.display = 'none';
            flashBtn.style.opacity = '0.5';
        }
    }
}

// Toggle flash
function toggleFlash() {
    if (!hasFlash || !stream) return;
    
    const track = stream.getVideoTracks()[0];
    
    // Toggle flash state
    flashOn = !flashOn;
    
    if (track.getCapabilities && track.getCapabilities().torch) {
        track.applyConstraints({
            advanced: [{ torch: flashOn }]
        });
        
        // Update the flash icon
        flashToggle.innerHTML = flashOn 
            ? '<i class="fas fa-bolt" style="color: yellow;"></i>' 
            : '<i class="fas fa-bolt"></i>';
        
        // Update the top feature button too
        flashBtn.innerHTML = flashOn 
            ? '<i class="fas fa-bolt" style="color: yellow;"></i><span>Flash</span>' 
            : '<i class="fas fa-bolt"></i><span>Flash</span>';
        
        flashBtn.classList.toggle('active', flashOn);
    }
}

// Toggle scanning mode (light/dark)
function toggleMode() {
    isDarkMode = !isDarkMode;
    darkModeToggle.checked = isDarkMode;
    
    // Update the icon
    modeToggle.innerHTML = isDarkMode 
        ? '<i class="fas fa-moon"></i>' 
        : '<i class="fas fa-sun"></i>';
    
    // Apply filter to camera preview
    if (isDarkMode) {
        cameraPreview.style.filter = 'none';
    } else {
        cameraPreview.style.filter = 'brightness(1.2) contrast(1.2)';
    }
}

// Open gallery to select images
function openGallery() {
    // Gallery functionality is handled by file input click event
}

// Handle file selection from gallery
function handleFileSelect(event) {
    const files = event.target.files;
    
    if (files && files.length > 0) {
        // Clear previous captures
        capturedImages = [];
        
        // Process each selected file
        Array.from(files).forEach(file => {
            if (file.type.startsWith('image/')) {
                const reader = new FileReader();
                
                reader.onload = function(e) {
                    capturedImages.push(e.target.result);
                    
                    // If this is the first image, display it
                    if (capturedImages.length === 1) {
                        showCapturedImage(capturedImages[0]);
                    }
                    
                    // If we have at least one image, generate PDF
                    if (capturedImages.length > 0) {
                        generatePDF();
                    }
                };
                
                reader.readAsDataURL(file);
            }
        });
        
        showNotification(`${files.length} फाइल चुनी गई`);
    }
}

// Take a picture using the camera
function takePicture() {
    if (!stream) return;
    
    // Add capture sound effect
    playCaptureSoundEffect();
    
    // Set canvas dimensions to match video dimensions
    const videoTrack = stream.getVideoTracks()[0];
    const settings = videoTrack.getSettings();
    
    captureCanvas.width = settings.width || cameraPreview.videoWidth;
    captureCanvas.height = settings.height || cameraPreview.videoHeight;
    
    // Draw the current frame from video to canvas
    const context = captureCanvas.getContext('2d');
    context.drawImage(cameraPreview, 0, 0, captureCanvas.width, captureCanvas.height);
    
    // Apply filters if needed
    if (autoEnhance || currentFilter !== 'normal') {
        applyEnhancementFilter(context, captureCanvas.width, captureCanvas.height);
    }
    
    // Get the captured image data
    const quality = scanQuality === 'high' ? 0.95 : (scanQuality === 'medium' ? 0.85 : 0.75);
    const imageData = captureCanvas.toDataURL('image/jpeg', quality);
    capturedImages.push(imageData);
    
    // Show the captured image
    showCapturedImage(imageData);
    
    // Generate PDF
    generatePDF();
}

// Play capture sound effect
function playCaptureSoundEffect() {
    const audio = new Audio('data:audio/mp3;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU4LjM1LjEwNAAAAAAAAAAAAAAA//uQwAAAAAAAAAAAAAAAAAAAAAAASW5mbwAAAA8AAAABAAADQgD///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////8AAAA5TEFNRTMuMTAwBK8AAAAAAAAAABUAJAJAQgAAgAAAA0L2YLwxAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA//uQxAADwAABpAAAACAAADSAAAAETEFNRTMuMTAwVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV');
    audio.play().catch(error => {
        console.log('Auto-play prevented for sound effect.');
    });
}

// Apply enhancement filter to improve image quality
function applyEnhancementFilter(context, width, height) {
    const imageData = context.getImageData(0, 0, width, height);
    const data = imageData.data;
    
    // Apply filter effects based on current filter and mode
    switch (currentFilter) {
        case 'grayscale':
            for (let i = 0; i < data.length; i += 4) {
                const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
                data[i] = avg;     // R
                data[i + 1] = avg; // G
                data[i + 2] = avg; // B
            }
            break;
            
        case 'enhanced':
            for (let i = 0; i < data.length; i += 4) {
                data[i] = Math.min(255, data[i] * 1.2);       // R
                data[i + 1] = Math.min(255, data[i + 1] * 1.2); // G
                data[i + 2] = Math.min(255, data[i + 2] * 1.2); // B
            }
            break;
            
        case 'bw':
            for (let i = 0; i < data.length; i += 4) {
                const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
                const val = avg > 128 ? 255 : 0;
                data[i] = val;     // R
                data[i + 1] = val; // G
                data[i + 2] = val; // B
            }
            break;
            
        case 'contrast':
            for (let i = 0; i < data.length; i += 4) {
                data[i] = Math.min(255, Math.max(0, (data[i] - 128) * 1.4 + 128));       // R
                data[i + 1] = Math.min(255, Math.max(0, (data[i + 1] - 128) * 1.4 + 128)); // G
                data[i + 2] = Math.min(255, Math.max(0, (data[i + 2] - 128) * 1.4 + 128)); // B
            }
            break;
            
        default:
            // For normal mode and when autoEnhance is true
            if (autoEnhance) {
                for (let i = 0; i < data.length; i += 4) {
                    data[i] = Math.min(255, data[i] * 1.1);       // R
                    data[i + 1] = Math.min(255, data[i + 1] * 1.1); // G
                    data[i + 2] = Math.min(255, data[i + 2] * 1.1); // B
                }
            }
            break;
    }
    
    // Special handling for different modes
    if (currentMode === 'text' || currentMode === 'docs') {
        // Increase contrast slightly for better text readability
        for (let i = 0; i < data.length; i += 4) {
            data[i] = Math.min(255, Math.max(0, (data[i] - 128) * 1.1 + 128));       // R
            data[i + 1] = Math.min(255, Math.max(0, (data[i + 1] - 128) * 1.1 + 128)); // G
            data[i + 2] = Math.min(255, Math.max(0, (data[i + 2] - 128) * 1.1 + 128)); // B
        }
    }
    
    context.putImageData(imageData, 0, 0);
}

// Show captured image and switch UI to review mode
function showCapturedImage(imageData) {
    // Hide camera preview and show captured image
    cameraPreview.style.display = 'none';
    capturedImageContainer.style.display = 'block';
    capturedImage.src = imageData;
    
    // Update buttons
    captureBtn.style.display = 'none';
    cancelBtn.style.display = 'flex';
    saveBtn.style.display = 'flex';
}

// Cancel current capture and return to camera mode
function cancelCapture() {
    // Remove the last captured image
    capturedImages.pop();
    
    // If we still have images, show the last one
    if (capturedImages.length > 0) {
        showCapturedImage(capturedImages[capturedImages.length - 1]);
    } else {
        // Otherwise return to camera mode
        returnToCameraMode();
    }
}

// Return to camera mode
function returnToCameraMode() {
    // Show camera preview and hide captured image
    cameraPreview.style.display = 'block';
    capturedImageContainer.style.display = 'none';
    
    // Reset buttons
    captureBtn.style.display = 'flex';
    cancelBtn.style.display = 'none';
    saveBtn.style.display = 'none';
}

// Save capture and generate PDF
function saveCapture() {
    // Show PDF preview
    openPdfPreview();
}

// Generate PDF from captured images
function generatePDF() {
    // Use jsPDF to create a new PDF
    const { jsPDF } = window.jspdf;
    
    // Set page format based on settings
    let options = {
        orientation: 'portrait',
        unit: 'mm'
    };
    
    if (pdfFormat !== 'auto') {
        options.format = pdfFormat;
    }
    
    const pdf = new jsPDF(options);
    
    // Process each captured image
    let prom = Promise.resolve();
    
    capturedImages.forEach((imgData, index) => {
        prom = prom.then(() => {
            return new Promise((resolve) => {
                const img = new Image();
                img.src = imgData;
                
                img.onload = function() {
                    // Calculate aspect ratio to fit image in PDF
                    const pageWidth = pdf.internal.pageSize.getWidth();
                    const pageHeight = pdf.internal.pageSize.getHeight();
                    
                    const imgWidth = img.width;
                    const imgHeight = img.height;
                    
                    let pdfWidth = pageWidth - 10; // Add some margin
                    let pdfHeight = (imgHeight * pdfWidth) / imgWidth;
                    
                    // If the image is too tall, scale based on height
                    if (pdfHeight > pageHeight - 10) {
                        pdfHeight = pageHeight - 10;
                        pdfWidth = (imgWidth * pdfHeight) / imgHeight;
                    }
                    
                    // Center the image
                    const xOffset = (pageWidth - pdfWidth) / 2;
                    const yOffset = (pageHeight - pdfHeight) / 2;
                    
                    // Add new page if not the first image
                    if (index > 0) {
                        pdf.addPage();
                    }
                    
                    // Add image to PDF
                    pdf.addImage(imgData, 'JPEG', xOffset, yOffset, pdfWidth, pdfHeight, null, 'FAST');
                    
                    // Add page number if multiple pages
                    if (capturedImages.length > 1) {
                        pdf.setFontSize(8);
                        pdf.setTextColor(100, 100, 100);
                        pdf.text(`${index + 1}/${capturedImages.length}`, pageWidth - 10, pageHeight - 5);
                    }
                    
                    resolve();
                };
            });
        });
    });
    
    // When all images are processed, create PDF blob
    prom.then(() => {
        currentPdfBlob = pdf.output('blob');
        
        // Create object URL for the blob
        const pdfUrl = URL.createObjectURL(currentPdfBlob);
        
        // Update iframe source
        pdfIframe.src = pdfUrl;
    });
}

// Add function to update PDF page info
function updatePdfPageInfo(currentPage, totalPages) {
    const pageInfoElement = document.getElementById('pdf-page-info');
    if (pageInfoElement) {
        pageInfoElement.textContent = `पेज ${currentPage} / ${totalPages}`;
    }
}

// Open PDF preview modal
function openPdfPreview() {
    if (!currentPdfBlob) return;
    
    // Reset PDF scale and rotation
    pdfScale = 1;
    pdfRotation = 0;
    
    // Create/update iframe source
    const pdfUrl = URL.createObjectURL(currentPdfBlob);
    pdfIframe.src = pdfUrl;
    
    // Show the modal
    pdfPreviewModal.style.display = 'flex';
    
    // Check current orientation
    checkAndAdjustForOrientation();
    
    // Add orientation change listener for responsive behavior
    window.addEventListener('resize', checkAndAdjustForOrientation);
    
    // Apply initial transform
    updatePdfTransform();
    
    // Scroll to top of container
    const container = document.getElementById('pdf-container');
    if (container) {
        container.scrollTop = 0;
    }
    
    // Better fullscreen experience on mobile
    if (window.innerWidth <= 768) {
        document.body.style.overflow = 'hidden';
    }
    
    // Get PDF info and update page information
    const reader = new FileReader();
    reader.onload = function(e) {
        const pdfData = new Uint8Array(e.target.result);
        pdfjsLib.getDocument({data: pdfData}).promise.then(pdf => {
            updatePdfPageInfo(1, pdf.numPages);
            
            // Store total pages for later reference
            window.totalPdfPages = pdf.numPages;
        });
    };
    reader.readAsArrayBuffer(currentPdfBlob);
    
    // Listen for iframe load to detect page changes
    pdfIframe.onload = function() {
        try {
            const iframe = document.getElementById('pdf-iframe');
            if (iframe && iframe.contentWindow) {
                // Try to detect page changes in the PDF viewer
                iframe.contentWindow.addEventListener('scroll', function() {
                    // This is a simplistic approach - we'll update page info based on scroll position
                    // In a real implementation, you'd want to use PDF.js events
                    if (window.totalPdfPages > 1) {
                        const scrollPos = iframe.contentWindow.scrollY;
                        const totalHeight = iframe.contentDocument.body.scrollHeight;
                        const viewportHeight = iframe.contentWindow.innerHeight;
                        
                        // Estimate current page based on scroll position
                        const scrollRatio = scrollPos / (totalHeight - viewportHeight);
                        const estimatedPage = Math.min(
                            Math.max(1, Math.ceil(scrollRatio * window.totalPdfPages)),
                            window.totalPdfPages
                        );
                        
                        updatePdfPageInfo(estimatedPage, window.totalPdfPages);
                    }
                });
            }
        } catch (error) {
            console.log('Could not add page change detection', error);
        }
    };
}

// Function to check orientation and adjust PDF display
function checkAndAdjustForOrientation() {
    const isLandscape = window.innerWidth > window.innerHeight;
    const pdfContainer = document.getElementById('pdf-container');
    
    if (isLandscape) {
        // In landscape mode, we make some adjustments
        if (window.innerWidth <= 768) {
            // Mobile landscape needs special handling
            pdfContainer.style.height = 'calc(100vh - 100px)';
        }
    } else {
        // In portrait mode
        if (window.innerWidth <= 768) {
            pdfContainer.style.height = 'calc(100vh - 140px)';
        } else {
            // Tablets and desktops in portrait
            pdfContainer.style.height = 'calc(90vh - 140px)';
        }
    }
    
    // Update PDF transform to adjust to new orientation
    updatePdfTransform();
}

// Close modal
function closeModal() {
    pdfPreviewModal.style.display = 'none';
    
    // Remove resize event listener when modal closes
    window.removeEventListener('resize', checkAndAdjustForOrientation);
    
    // Re-enable body scroll when modal closes
    document.body.style.overflow = '';
    
    // Return to camera mode if we were in capture mode
    if (cameraPreview.style.display === 'none') {
        returnToCameraMode();
    }
}

// Download PDF
function downloadPdf() {
    if (!currentPdfBlob) return;
    
    // Create a timestamp for the filename
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    
    // Create filename based on current mode
    let filePrefix = 'scanned-document';
    switch (currentMode) {
        case 'book':
            filePrefix = 'scanned-book';
            break;
        case 'text':
            filePrefix = 'scanned-text';
            break;
        case 'docs':
            filePrefix = 'scanned-document';
            break;
        case 'idcard':
            filePrefix = 'scanned-idcard';
            break;
        case 'qrcode':
            filePrefix = 'scanned-qrcode';
            break;
    }
    
    const filename = `${filePrefix}-${timestamp}.pdf`;
    
    // Create download link
    const link = document.createElement('a');
    link.href = URL.createObjectURL(currentPdfBlob);
    link.download = filename;
    
    // Trigger download
    document.body.appendChild(link);
    link.click();
    
    // Clean up
    document.body.removeChild(link);
    
    // Close modal
    closeModal();
    
    // Reset captured images and return to camera mode
    capturedImages = [];
    returnToCameraMode();
    
    showNotification('PDF सफलतापूर्वक डाउनलोड किया गया');
}

// Handle Flash Button Click
function handleFlashBtn() {
    if (!hasFlash || !stream) {
        showNotification('कैमरा फ्लैश उपलब्ध नहीं है');
        return;
    }
    
    toggleFlash();
    
    // Toggle active state of the button
    flashBtn.classList.toggle('active', flashOn);
}

// Toggle HD Mode
function toggleHDMode() {
    hdMode = !hdMode;
    
    // Toggle active state of the button
    hdBtn.classList.toggle('active', hdMode);
    
    // Update camera constraints if stream is active
    if (stream) {
        restartCameraWithNewConstraints();
    }
    
    // Show better notification with HD icon
    showNotification(`<i class="fas fa-hd" style="color:${hdMode ? '#007bff' : 'white'}"></i> ${hdMode ? 'HD मोड चालू' : 'HD मोड बंद'}`);
}

// Restart camera with new constraints
async function restartCameraWithNewConstraints() {
    if (!stream) return;
    
    // Store old tracks to stop after new stream is established
    const oldTracks = stream.getTracks();
    
    // Request camera access with new resolution based on HD mode
    const constraints = {
        video: {
            facingMode: 'environment',
            width: hdMode ? { ideal: 3840 } : { ideal: 1920 },
            height: hdMode ? { ideal: 2160 } : { ideal: 1080 },
            advanced: [{ zoom: hdMode ? 1.5 : 1.0 }] // Optical zoom if available
        }
    };
    
    try {
        // First attempt to get the new stream before stopping the old one
        const newStream = await navigator.mediaDevices.getUserMedia(constraints);
        
        // Only stop old tracks after successfully getting new stream
        oldTracks.forEach(track => track.stop());
        
        // Set the new stream
        stream = newStream;
        cameraPreview.srcObject = stream;
        
        // Re-check flash availability with new stream
        checkFlashAvailability();
        
        // Update HD icon visibility
        updateHDIndicator();
    } catch (error) {
        console.error('Error restarting camera:', error);
        
        // Show more helpful error message
        showNotification('कैमरा रीस्टार्ट में समस्या हुई, कृपया पुनः प्रयास करें', 'error');
    }
}

// Add new function to update HD indicator
function updateHDIndicator() {
    const hdIndicator = document.getElementById('hd-indicator');
    
    if (hdMode) {
        hdBtn.innerHTML = '<i class="fas fa-hd" style="color: #007bff;"></i><span style="color: #007bff; font-weight: bold;">HD</span>';
        // Show the HD indicator on camera preview
        hdIndicator.style.display = 'block';
    } else {
        hdBtn.innerHTML = '<i class="fas fa-hd"></i><span>HD</span>';
        // Hide the HD indicator
        hdIndicator.style.display = 'none';
    }
}

// Toggle Grid Overlay
function toggleGrid() {
    gridVisible = !gridVisible;
    gridOverlay.style.display = gridVisible ? 'block' : 'none';
    gridBtn.classList.toggle('active', gridVisible);
}

// Open Filter Modal
function openFilterModal() {
    filterModal.style.display = 'flex';
    
    // Mark current filter as active
    filterOptions.forEach(option => {
        const filter = option.getAttribute('data-filter');
        option.classList.toggle('active', filter === currentFilter);
    });
}

// Close Filter Modal
function closeFilterModal() {
    filterModal.style.display = 'none';
}

// Apply selected filter
function applyFilter(filter) {
    currentFilter = filter;
    
    // Apply filter to camera preview
    switch (filter) {
        case 'normal':
            cameraPreview.style.filter = 'none';
            break;
        case 'grayscale':
            cameraPreview.style.filter = 'grayscale(100%)';
            break;
        case 'enhanced':
            cameraPreview.style.filter = 'contrast(120%) brightness(110%)';
            break;
        case 'bw':
            cameraPreview.style.filter = 'grayscale(100%) contrast(150%) brightness(120%)';
            break;
        case 'contrast':
            cameraPreview.style.filter = 'contrast(140%)';
            break;
    }
    
    // Update filter button to show it's active
    filterBtn.classList.add('active');
    
    showNotification(`${filter} फिल्टर लागू किया गया`);
}

// Open Settings Modal
function openSettingsModal() {
    settingsModal.style.display = 'flex';
    
    // Set current values
    qualitySetting.value = scanQuality;
    formatSetting.value = pdfFormat;
    autoEnhanceToggle.checked = autoEnhance;
    darkModeToggle.checked = isDarkMode;
}

// Close Settings Modal
function closeSettingsModal() {
    settingsModal.style.display = 'none';
}

// Update Quality Setting
function updateQualitySetting() {
    scanQuality = qualitySetting.value;
    showNotification(`स्कैन क्वालिटी: ${scanQuality}`);
}

// Update Format Setting
function updateFormatSetting() {
    pdfFormat = formatSetting.value;
    showNotification(`PDF फॉर्मेट: ${pdfFormat}`);
}

// Update Auto Enhance Setting
function updateAutoEnhance() {
    autoEnhance = autoEnhanceToggle.checked;
}

// Update Dark Mode Setting
function updateDarkModeSetting() {
    isDarkMode = darkModeToggle.checked;
    
    // Apply dark mode changes
    if (isDarkMode) {
        document.body.classList.add('dark-mode');
        modeToggle.innerHTML = '<i class="fas fa-moon"></i>';
        cameraPreview.style.filter = 'none';
    } else {
        document.body.classList.remove('dark-mode');
        modeToggle.innerHTML = '<i class="fas fa-sun"></i>';
        cameraPreview.style.filter = 'brightness(1.2) contrast(1.2)';
    }
}

// Switch between different scanning modes
function switchMode(mode) {
    if (mode === currentMode) return;
    
    // Remove active class from all mode buttons
    document.querySelectorAll('.mode-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Add active class to selected mode button
    document.getElementById(`${mode}-mode`).classList.add('active');
    
    // Save current mode
    currentMode = mode;
    
    // Adjust UI based on mode
    adjustUIForMode(mode);
    
    showNotification(`${mode} मोड चालू`);
}

// Adjust UI based on selected mode
function adjustUIForMode(mode) {
    // Reset any mode-specific settings
    gridOverlay.style.display = 'none';
    gridVisible = false;
    gridBtn.classList.remove('active');
    
    switch (mode) {
        case 'book':
            // Show grid for book alignment
            gridOverlay.style.display = 'block';
            gridVisible = true;
            gridBtn.classList.add('active');
            break;
            
        case 'text':
            // Apply high contrast filter for better text recognition
            applyFilter('enhanced');
            break;
            
        case 'docs':
            // Default document scanning mode
            applyFilter('normal');
            break;
            
        case 'idcard':
            // Show grid for ID card alignment
            gridOverlay.style.display = 'block';
            gridVisible = true;
            gridBtn.classList.add('active');
            applyFilter('enhanced');
            break;
            
        case 'qrcode':
            // Enhance contrast for QR code scanning
            applyFilter('contrast');
            break;
            
        case 'import':
            // This is handled by the file input click
            break;
    }
}

// Show notification
function showNotification(message, type = 'info') {
    // Create notification element if it doesn't exist
    let notification = document.getElementById('notification');
    if (!notification) {
        notification = document.createElement('div');
        notification.id = 'notification';
        notification.style.position = 'fixed';
        notification.style.top = '20px';
        notification.style.left = '50%';
        notification.style.transform = 'translateX(-50%)';
        notification.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
        notification.style.color = 'white';
        notification.style.padding = '12px 20px';
        notification.style.borderRadius = '8px';
        notification.style.zIndex = '1000';
        notification.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.3)';
        notification.style.transition = 'all 0.3s ease';
        notification.style.opacity = '0';
        document.body.appendChild(notification);
    }
    
    // Set color based on type
    if (type === 'error') {
        notification.style.backgroundColor = 'rgba(220, 53, 69, 0.9)';
    } else if (type === 'success') {
        notification.style.backgroundColor = 'rgba(40, 167, 69, 0.9)';
    } else {
        notification.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
    }
    
    // Set message
    notification.innerHTML = message;
    
    // Show notification
    notification.style.opacity = '1';
    
    // Auto hide after delay
    setTimeout(() => {
        notification.style.opacity = '0';
        setTimeout(() => {
            notification.style.display = 'none';
        }, 300);
    }, 3000);
    
    notification.style.display = 'block';
}

// Update camera device list
async function updateCameraDeviceList() {
    try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        availableCameras = devices.filter(device => device.kind === 'videoinput');
        console.log('कैमरा सूची अपडेट की गई:', availableCameras);
        
        // Update camera switch button visibility
        cameraSwitchBtn.style.display = availableCameras.length > 1 ? 'flex' : 'none';
        
        // Show notification if new cameras connected
        if (availableCameras.length > 1) {
            showNotification(`${availableCameras.length} कैमरा मिले`, 'info');
        }
    } catch (error) {
        console.error('कैमरा डिवाइस लिस्ट अपडेट में त्रुटि:', error);
    }
}

// Switch between available cameras
async function switchCamera() {
    if (availableCameras.length <= 1) {
        showNotification('कोई अतिरिक्त कैमरा कनेक्टेड नहीं है', 'info');
        updateCameraDeviceList();
        return;
    }

    // Update current camera index
    currentCameraIndex = (currentCameraIndex + 1) % availableCameras.length;
    const nextCamera = availableCameras[currentCameraIndex];
    
    // Stop current stream
    if (stream) {
        stream.getTracks().forEach(track => track.stop());
    }
    
    try {
        // Request the next camera
        const constraints = {
            video: {
                deviceId: { exact: nextCamera.deviceId },
                width: hdMode ? { ideal: 3840 } : { ideal: 1920 },
                height: hdMode ? { ideal: 2160 } : { ideal: 1080 }
            }
        };
        
        stream = await navigator.mediaDevices.getUserMedia(constraints);
        cameraPreview.srcObject = stream;
        
        // Check if flash is available
        checkFlashAvailability();
        
        // Apply current filter
        applyFilter(currentFilter);
        
        // Update HD indicator
        updateHDIndicator();
        
        // Show grid if enabled
        if (gridVisible) {
            gridOverlay.style.display = 'block';
        }
        
        // Show camera info
        const videoTrack = stream.getVideoTracks()[0];
        if (videoTrack) {
            const label = videoTrack.label || `कैमरा ${currentCameraIndex + 1}`;
            showNotification(`कैमरा बदला गया: ${label}`, 'success');
        }
    } catch (error) {
        console.error('कैमरा स्विच करने में त्रुटि:', error);
        showNotification('कैमरा स्विच करने में समस्या', 'error');
        
        // Try to switch back to the previously working camera
        currentCameraIndex = (currentCameraIndex - 1 + availableCameras.length) % availableCameras.length;
        restartCameraWithNewConstraints();
    }
}

// Function to handle permission button click
async function handlePermissionRequest() {
    permissionContainer.style.display = 'none';
    try {
        // Request both camera and storage permissions
        await requestCameraPermission();
        await requestStoragePermission();
        await startCamera();
    } catch (error) {
        console.error('परमिशन प्राप्त करने में विफल:', error);
        showPermissionUI();
    }
}

// Function to show permission UI
function showPermissionUI() {
    permissionContainer.style.display = 'flex';
    cameraPreview.style.display = 'none';
    noPreview.style.display = 'none';
}

// Add a new function to explicitly request camera permission
async function requestCameraPermission() {
    try {
        // Try to access camera with minimal constraints
        const tempStream = await navigator.mediaDevices.getUserMedia({ 
            video: true,
            audio: false 
        });
        
        // If successful, immediately stop the tracks
        tempStream.getTracks().forEach(track => track.stop());
        
        console.log('कैमरा अनुमति प्राप्त हुई');
        return true;
    } catch (error) {
        console.error('कैमरा अनुमति प्राप्त करने में विफल:', error);
        showNotification('कैमरा के लिए अनुमति दें! फोन की सेटिंग्स में जाकर अपने ऐप को कैमरा एक्सेस दें।', 'error', 7000);
        showPermissionUI();
        throw error;
    }
}

// Add a new function to explicitly request storage permission
async function requestStoragePermission() {
    // For Android devices running through WebView in the APK
    if (typeof Android !== 'undefined' && Android.requestStoragePermission) {
        // Call the Android bridge method if available
        Android.requestStoragePermission();
        return true;
    }
    
    // For browsers that support the File System Access API
    if ('showOpenFilePicker' in window) {
        try {
            const opts = {
                types: [
                    {
                        description: 'Images',
                        accept: {
                            'image/*': ['.png', '.jpg', '.jpeg']
                        }
                    }
                ],
                excludeAcceptAllOption: true,
                multiple: false
            };
            
            // Just to trigger the permission prompt
            await window.showOpenFilePicker(opts);
            console.log('स्टोरेज परमिशन मिल गई');
            return true;
        } catch (error) {
            // User likely cancelled, which is okay
            console.log('स्टोरेज परमिशन का डायलॉग बंद किया गया');
        }
    }
    
    // No explicit way to request storage permission in web
    console.log('स्टोरेज परमिशन अनुरोध नहीं किया जा सका, स्टोरेज एक्सेस पहली फाइल सेविंग पर की जाएगी');
    showNotification('फाइल सेव करते समय स्टोरेज परमिशन दें', 'info', 3000);
    return true;
}

// Open signature modal
function openSignatureModal() {
    signatureModal.style.display = 'flex';
    
    // Setup canvas
    setupSignatureCanvas();
}

// Setup signature canvas
function setupSignatureCanvas() {
    const canvas = signatureCanvas;
    signatureCtx = canvas.getContext('2d');
    
    // Set canvas size
    const canvasRect = canvas.getBoundingClientRect();
    canvas.width = canvasRect.width;
    canvas.height = canvasRect.height;
    
    // Set default styles
    signatureCtx.strokeStyle = signatureColor;
    signatureCtx.lineWidth = signatureWidth.value;
    signatureCtx.lineCap = 'round';
    signatureCtx.lineJoin = 'round';
    
    // Make canvas transparent (don't fill with white)
    signatureCtx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Add event listeners
    canvas.addEventListener('mousedown', startDrawing);
    canvas.addEventListener('mousemove', draw);
    canvas.addEventListener('mouseup', stopDrawing);
    canvas.addEventListener('mouseout', stopDrawing);
    
    // Touch events
    canvas.addEventListener('touchstart', startDrawingTouch);
    canvas.addEventListener('touchmove', drawTouch);
    canvas.addEventListener('touchend', stopDrawing);
}

// Start drawing with mouse
function startDrawing(e) {
    isDrawing = true;
    [lastX, lastY] = [e.offsetX, e.offsetY];
}

// Draw with mouse
function draw(e) {
    if (!isDrawing) return;
    signatureCtx.strokeStyle = signatureColor;
    
    signatureCtx.beginPath();
    signatureCtx.moveTo(lastX, lastY);
    signatureCtx.lineTo(e.offsetX, e.offsetY);
    signatureCtx.stroke();
    
    [lastX, lastY] = [e.offsetX, e.offsetY];
    hasSignature = true;
    
    // Update signature image with filter when drawing is happening
    if (currentSignatureFilter !== 'normal') {
        updateSignatureWithFilter();
    } else {
        // Update signature image directly if no filter
        signatureImage = signatureCanvas.toDataURL('image/png');
    }
}

// Start drawing with touch
function startDrawingTouch(e) {
    e.preventDefault();
    const touch = e.touches[0];
    const rect = signatureCanvas.getBoundingClientRect();
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;
    
    isDrawing = true;
    [lastX, lastY] = [x, y];
}

// Draw with touch
function drawTouch(e) {
    e.preventDefault();
    if (!isDrawing) return;
    
    const touch = e.touches[0];
    const rect = signatureCanvas.getBoundingClientRect();
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;
    
    signatureCtx.strokeStyle = signatureColor;
    
    signatureCtx.beginPath();
    signatureCtx.moveTo(lastX, lastY);
    signatureCtx.lineTo(x, y);
    signatureCtx.stroke();
    
    [lastX, lastY] = [x, y];
    hasSignature = true;
    
    // Update signature image with filter when drawing is happening
    if (currentSignatureFilter !== 'normal') {
        updateSignatureWithFilter();
    } else {
        // Update signature image directly if no filter
        signatureImage = signatureCanvas.toDataURL('image/png');
    }
}

// Stop drawing
function stopDrawing() {
    isDrawing = false;
}

// Clear signature
function clearSignature() {
    if (!signatureCtx) return;
    // Clear with transparency
    signatureCtx.clearRect(0, 0, signatureCanvas.width, signatureCanvas.height);
    hasSignature = false;
    
    // Clear preview
    signatureSizePreview.innerHTML = '';
}

// Close signature modal
function closeSignatureModal() {
    signatureModal.style.display = 'none';
}

// Apply signature to PDF
function applySignature() {
    if (!hasSignature) {
        showNotification('कृपया पहले अपना हस्ताक्षर करें', 'error');
        return;
    }
    
    // Make sure we have the latest filtered image
    if (currentSignatureFilter !== 'normal') {
        updateSignatureWithFilter();
    } else {
        signatureImage = signatureCanvas.toDataURL('image/png');
    }
    
    // Show loading notification
    showNotification('सिग्नेचर जोड़ा जा रहा है...', 'info');
    
    try {
        // Close signature modal
        closeSignatureModal();
        
        // Create a new jsPDF instance
        const { jsPDF } = window.jspdf;
        
        // Process the current PDF
        const reader = new FileReader();
        reader.readAsArrayBuffer(currentPdfBlob);
        
        reader.onload = async function(e) {
            try {
                // Load the PDF document
                const pdfData = new Uint8Array(e.target.result);
                const pdfDoc = await pdfjsLib.getDocument({data: pdfData}).promise;
                const totalPages = pdfDoc.numPages;
                
                // Get current visible page
                const currentPage = window.currentVisiblePage || 1;
                
                // Create a new PDF
                const pdf = new jsPDF({
                    orientation: 'portrait',
                    unit: 'mm',
                    format: pdfFormat !== 'auto' ? pdfFormat : 'a4'
                });
                
                // Get PDF dimensions
                const pdfWidth = pdf.internal.pageSize.getWidth();
                const pdfHeight = pdf.internal.pageSize.getHeight();
                
                // Create image object to get signature dimensions
                const sigImg = new Image();
                sigImg.src = signatureImage;
                
                // Wait for image to load
                await new Promise((resolve) => {
                    sigImg.onload = resolve;
                    sigImg.onerror = () => {
                        console.error('Error loading signature image');
                        resolve();
                    };
                });
                
                // Calculate signature aspect ratio
                const aspectRatio = sigImg.width / sigImg.height;
                
                // Process each page
                for (let i = 1; i <= totalPages; i++) {
                    // Add a new page for pages after the first one
                    if (i > 1) {
                        pdf.addPage();
                    }
                    
                    // Get the page
                    const page = await pdfDoc.getPage(i);
                    const viewport = page.getViewport({scale: 1.5});
                    
                    // Create a canvas to render the page
                    const canvas = document.createElement('canvas');
                    const context = canvas.getContext('2d');
                    canvas.width = viewport.width;
                    canvas.height = viewport.height;
                    
                    // Render the page to canvas
                    await page.render({
                        canvasContext: context,
                        viewport: viewport
                    }).promise;
                    
                    // Add the page to the new PDF
                    pdf.addImage(
                        canvas.toDataURL('image/jpeg', 0.8),
                        'JPEG',
                        0,
                        0,
                        pdfWidth,
                        pdfHeight,
                        null,
                        'FAST'
                    );
                    
                    // Add signature to the current page
                    if (i === currentPage) {
                        // Set signature width to 25% of page width
                        const sigWidth = pdfWidth * 0.25;
                        const sigHeight = sigWidth / aspectRatio;
                        
                        // Position at the bottom right (70% from left, 90% from top)
                        const xPos = pdfWidth * 0.7;
                        const yPos = pdfHeight * 0.9 - sigHeight;
                        
                        console.log('Adding signature with dimensions:', {
                            width: sigWidth,
                            height: sigHeight,
                            x: xPos,
                            y: yPos,
                            aspectRatio: aspectRatio
                        });
                        
                        // Add signature
                        pdf.addImage(
                            signatureImage,
                            'PNG',
                            xPos,
                            yPos,
                            sigWidth,
                            sigHeight
                        );
                    }
                }
                
                // Update the current PDF
                currentPdfBlob = pdf.output('blob');
                
                // Update the PDF preview
                const pdfUrl = URL.createObjectURL(currentPdfBlob);
                pdfIframe.src = pdfUrl;
                
                // Show success notification
                showNotification('सिग्नेचर सफलतापूर्वक जोड़ा गया', 'success');
                
            } catch (error) {
                console.error('PDF प्रोसेसिंग में त्रुटि:', error);
                showNotification('सिग्नेचर जोड़ने में समस्या हुई', 'error');
            }
        };
        
        reader.onerror = function(error) {
            console.error('PDF फाइल पढ़ने में त्रुटि:', error);
            showNotification('सिग्नेचर जोड़ने में समस्या हुई', 'error');
        };
        
    } catch (error) {
        console.error('सिग्नेचर अप्लाई करने में त्रुटि:', error);
        showNotification('सिग्नेचर जोड़ने में समस्या हुई', 'error');
    }
}

// Add signature to PDF
function addSignatureToPdf() {
    // Simply call applySignature instead of showing draggable UI
    applySignature();
}

// Update signature line width
function updateSignatureWidth() {
    if (!signatureCtx) return;
    signatureCtx.lineWidth = signatureWidth.value;
}

// Update signature scale/size
function updateSignatureScale() {
    signatureScale = parseInt(signatureSize.value);
    updateSignatureSizePreview();
}

// Decrease signature size
function decreaseSignatureSize() {
    signatureSize.value = Math.max(10, parseInt(signatureSize.value) - 5);
    updateSignatureScale();
}

// Increase signature size
function increaseSignatureSize() {
    signatureSize.value = Math.min(50, parseInt(signatureSize.value) + 5);
    updateSignatureScale();
}

// Update the signature size preview
function updateSignatureSizePreview() {
    if (!hasSignature || !signatureImage) return;
    
    // Create preview image
    const img = document.createElement('img');
    img.src = signatureImage;
    
    // Clear previous preview
    signatureSizePreview.innerHTML = '';
    signatureSizePreview.appendChild(img);
}

// Zoom in PDF
function zoomInPdf() {
    pdfScale = Math.min(3.0, pdfScale + 0.25);
    updatePdfTransform();
    showNotification(`ज़ूम: ${Math.round(pdfScale * 100)}%`, 'info');
}

// Zoom out PDF
function zoomOutPdf() {
    pdfScale = Math.max(0.5, pdfScale - 0.25);
    updatePdfTransform();
    showNotification(`ज़ूम: ${Math.round(pdfScale * 100)}%`, 'info');
}

// Rotate PDF
function rotatePdf() {
    pdfRotation = (pdfRotation + 90) % 360;
    updatePdfTransform();
    showNotification(`रोटेशन: ${pdfRotation}°`, 'info');
}

// Update PDF transform
function updatePdfTransform() {
    const iframe = document.getElementById('pdf-iframe');
    if (!iframe) return;
    
    // Create a container to handle the transformations better
    const container = iframe.parentElement;
    
    // Handle special conditions for mobile devices
    const isMobile = window.innerWidth <= 768;
    const isLandscape = window.innerWidth > window.innerHeight;
    
    // Adjust scaling based on device orientation and size
    let adjustedScale = pdfScale;
    if (isMobile && isLandscape) {
        // Landscape on mobile needs a smaller scale factor
        adjustedScale = pdfScale * 0.8;
    }
    
    // Special handling for rotation
    if (pdfRotation === 90 || pdfRotation === 270) {
        // For 90/270 degrees, special handling needed
        iframe.style.width = '100%';
        iframe.style.height = '100%';
        
        // Fit better on different screen sizes
        if (isMobile) {
            iframe.style.transform = `scale(${adjustedScale * 0.7}) rotate(${pdfRotation}deg)`;
        } else {
            iframe.style.transform = `scale(${adjustedScale * 0.8}) rotate(${pdfRotation}deg)`;
        }
    } else {
        // Normal rotation (0 or 180 degrees)
        iframe.style.width = '100%';
        iframe.style.height = '100%';
        iframe.style.transform = `scale(${adjustedScale}) rotate(${pdfRotation}deg)`;
    }
    
    // Always set transform origin to center
    iframe.style.transformOrigin = 'center center';
    
    // Make iframe display as block for better sizing
    iframe.style.display = 'block';
    iframe.style.margin = '0 auto';
    
    // Always enable scrolling with smooth behavior
    container.style.overflow = 'auto';
    container.style.scrollBehavior = 'smooth';
}

// Show draggable signature on PDF
function showDraggableSignature() {
    // Create signature container if it doesn't exist
    if (!signatureElement) {
        const pdfContainer = document.getElementById('pdf-container');
        const pdfIframe = document.getElementById('pdf-iframe');
        
        // Create container for draggable signature
        signatureElement = document.createElement('div');
        signatureElement.id = 'draggable-signature';
        signatureElement.style.position = 'absolute';
        signatureElement.style.cursor = 'move';
        signatureElement.style.zIndex = '1000';
        signatureElement.style.userSelect = 'none';
        signatureElement.style.border = '1px dashed #007bff';
        signatureElement.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
        
        // Create the signature image
        const img = document.createElement('img');
        img.src = signatureImage;
        img.style.width = '100%';
        img.style.height = '100%';
        img.style.pointerEvents = 'none'; // Prevent image from blocking events
        img.style.opacity = '0.9'; // Slightly transparent for better positioning
        
        // Create resize handle
        const resizeHandle = document.createElement('div');
        resizeHandle.className = 'resize-handle';
        resizeHandle.style.position = 'absolute';
        resizeHandle.style.width = '24px';
        resizeHandle.style.height = '24px';
        resizeHandle.style.right = '0';
        resizeHandle.style.bottom = '0';
        resizeHandle.style.background = '#007bff';
        resizeHandle.style.cursor = 'nwse-resize';
        resizeHandle.style.borderRadius = '50%';
        resizeHandle.style.boxShadow = '0 0 5px rgba(0,0,0,0.3)';
        resizeHandle.innerHTML = '<i class="fas fa-expand-arrows-alt" style="color:white; font-size:12px; margin:6px;"></i>';
        
        // Add controls container
        const controlsContainer = document.createElement('div');
        controlsContainer.className = 'signature-controls';
        controlsContainer.style.position = 'absolute';
        controlsContainer.style.top = '-45px';
        controlsContainer.style.left = '0';
        controlsContainer.style.right = '0';
        controlsContainer.style.display = 'flex';
        controlsContainer.style.justifyContent = 'center';
        controlsContainer.style.gap = '10px';
        
        // Apply button
        const applyBtn = document.createElement('button');
        applyBtn.innerHTML = '<i class="fas fa-check"></i>';
        applyBtn.style.padding = '8px 15px';
        applyBtn.style.background = '#28a745';
        applyBtn.style.color = 'white';
        applyBtn.style.border = 'none';
        applyBtn.style.borderRadius = '4px';
        applyBtn.style.cursor = 'pointer';
        applyBtn.style.boxShadow = '0 2px 5px rgba(0,0,0,0.2)';
        applyBtn.title = 'सिग्नेचर लागू करें';
        applyBtn.onclick = finalizeSignature;
        
        // Cancel button
        const cancelBtn = document.createElement('button');
        cancelBtn.innerHTML = '<i class="fas fa-times"></i>';
        cancelBtn.style.padding = '8px 15px';
        cancelBtn.style.background = '#dc3545';
        cancelBtn.style.color = 'white';
        cancelBtn.style.border = 'none';
        cancelBtn.style.borderRadius = '4px';
        cancelBtn.style.cursor = 'pointer';
        cancelBtn.style.boxShadow = '0 2px 5px rgba(0,0,0,0.2)';
        cancelBtn.title = 'रद्द करें';
        cancelBtn.onclick = removeDraggableSignature;
        
        // Add buttons to controls
        controlsContainer.appendChild(cancelBtn);
        controlsContainer.appendChild(applyBtn);
        
        // Add elements to signature container
        signatureElement.appendChild(img);
        signatureElement.appendChild(resizeHandle);
        signatureElement.appendChild(controlsContainer);
        
        // Add event listeners for dragging
        signatureElement.addEventListener('mousedown', startSignatureDrag);
        document.addEventListener('mousemove', dragSignature);
        document.addEventListener('mouseup', stopSignatureDrag);
        
        // Touch events for mobile
        signatureElement.addEventListener('touchstart', startSignatureDragTouch);
        document.addEventListener('touchmove', dragSignatureTouch);
        document.addEventListener('touchend', stopSignatureDrag);
        
        // Resize events
        resizeHandle.addEventListener('mousedown', startSignatureResize);
        resizeHandle.addEventListener('touchstart', startSignatureResizeTouch);
        
        // Add to PDF container
        pdfContainer.appendChild(signatureElement);
    } else {
        // Show existing signature element
        signatureElement.style.display = 'block';
        
        // Update the image
        const img = signatureElement.querySelector('img');
        if (img) {
            img.src = signatureImage;
        }
    }
    
    // Set initial position (centered in the visible area of container)
    const pdfContainer = document.getElementById('pdf-container');
    const pdfRect = pdfContainer.getBoundingClientRect();
    
    // Load the signature image to get its natural aspect ratio
    const tempImg = new Image();
    tempImg.src = signatureImage;
    
    tempImg.onload = function() {
        // Store original aspect ratio as a data attribute on the signature element
        const originalAspectRatio = tempImg.width / tempImg.height;
        signatureElement.dataset.aspectRatio = originalAspectRatio;
        
        // Use a fixed size for the signature (30%)
        const signaturePercent = 0.3; // 30% fixed size instead of using signatureScale
        const maxWidth = Math.min(pdfRect.width * 0.3, 200); // 30% of container width, max 200px
        
        // Set initial width
        const sigWidth = maxWidth * signaturePercent;
        // Calculate height based on original aspect ratio
        const sigHeight = sigWidth / originalAspectRatio;
        
        // Set size maintaining aspect ratio
        signatureElement.style.width = `${sigWidth}px`;
        signatureElement.style.height = `${sigHeight}px`;
        
        // Position in center-bottom area of visible container
        signatureElement.style.left = `${(pdfRect.width - sigWidth) / 2}px`;
        signatureElement.style.top = `${pdfRect.height * 0.6}px`; // Position at 60% from top
    };
    
    tempImg.onerror = function() {
        console.error('सिग्नेचर इमेज लोड नहीं हो पाई');
        showNotification('सिग्नेचर इमेज लोड नहीं हो पाई', 'error');
    };
}

// Handle resizing with mouse
function dragSignature(e) {
    if (!signatureDragging && !signatureResizing) return;
    e.preventDefault();
    
    if (signatureDragging) {
        // Get the container bounds for constraint checking
        const pdfContainer = document.getElementById('pdf-container');
        const containerRect = pdfContainer.getBoundingClientRect();
        
        // Calculate new position directly relative to container
        const newLeft = e.clientX - initialMousePos.offsetX - initialMousePos.containerLeft;
        const newTop = e.clientY - initialMousePos.offsetY - initialMousePos.containerTop;
        
        // Get signature dimensions
        const sigWidth = signatureElement.offsetWidth;
        const sigHeight = signatureElement.offsetHeight;
        
        // Constrain to container boundaries
        const constrainedLeft = Math.max(0, Math.min(newLeft, containerRect.width - sigWidth));
        const constrainedTop = Math.max(0, Math.min(newTop, containerRect.height - sigHeight));
        
        // Update position
        signatureElement.style.left = `${constrainedLeft}px`;
        signatureElement.style.top = `${constrainedTop}px`;
    }
    else if (signatureResizing) {
        // Get original aspect ratio from data attribute
        const aspectRatio = parseFloat(signatureElement.dataset.aspectRatio) || 
                           (initialSignatureSize.width / initialSignatureSize.height);
        
        // Handle resizing
        const dx = e.clientX - initialMousePos.x;
        
        // Calculate new width based on drag distance
        let newWidth = Math.max(30, initialSignatureSize.width + dx);
        
        // Calculate height to maintain aspect ratio
        let newHeight = newWidth / aspectRatio;
        
        // Get container bounds
        const pdfContainer = document.getElementById('pdf-container');
        const containerRect = pdfContainer.getBoundingClientRect();
        
        // Ensure signature doesn't resize beyond container or become too small
        const sigRect = signatureElement.getBoundingClientRect();
        const sigLeft = sigRect.left - containerRect.left;
        const sigTop = sigRect.top - containerRect.top;
        
        newWidth = Math.min(Math.max(30, newWidth), containerRect.width - sigLeft - 5);
        // Recalculate height after constraining width
        newHeight = newWidth / aspectRatio;
        
        // Make sure height is also within bounds
        if (sigTop + newHeight > containerRect.height - 5) {
            // If height exceeds bounds, cap it and recalculate width
            newHeight = containerRect.height - sigTop - 5;
            newWidth = newHeight * aspectRatio;
        }
        
        // Update size
        signatureElement.style.width = `${newWidth}px`;
        signatureElement.style.height = `${newHeight}px`;
    }
}

// Handle touch resizing and dragging
function dragSignatureTouch(e) {
    if (!signatureDragging && !signatureResizing) return;
    e.preventDefault();
    
    // Get the touch
    const touch = e.touches[0];
    
    if (signatureDragging) {
        // Get the container bounds for constraint checking
        const pdfContainer = document.getElementById('pdf-container');
        const containerRect = pdfContainer.getBoundingClientRect();
        
        // Calculate new position directly relative to container
        const newLeft = touch.clientX - initialMousePos.offsetX - initialMousePos.containerLeft;
        const newTop = touch.clientY - initialMousePos.offsetY - initialMousePos.containerTop;
        
        // Get signature dimensions
        const sigWidth = signatureElement.offsetWidth;
        const sigHeight = signatureElement.offsetHeight;
        
        // Constrain to container boundaries
        const constrainedLeft = Math.max(0, Math.min(newLeft, containerRect.width - sigWidth));
        const constrainedTop = Math.max(0, Math.min(newTop, containerRect.height - sigHeight));
        
        // Update position
        signatureElement.style.left = `${constrainedLeft}px`;
        signatureElement.style.top = `${constrainedTop}px`;
    }
    else if (signatureResizing) {
        // Get original aspect ratio from data attribute
        const aspectRatio = parseFloat(signatureElement.dataset.aspectRatio) || 
                           (initialSignatureSize.width / initialSignatureSize.height);
        
        // Handle resizing
        const dx = touch.clientX - initialMousePos.x;
        
        // Calculate new width based on drag distance
        let newWidth = Math.max(30, initialSignatureSize.width + dx);
        
        // Calculate height to maintain aspect ratio
        let newHeight = newWidth / aspectRatio;
        
        // Get container bounds
        const pdfContainer = document.getElementById('pdf-container');
        const containerRect = pdfContainer.getBoundingClientRect();
        
        // Ensure signature doesn't resize beyond container
        const sigRect = signatureElement.getBoundingClientRect();
        const sigLeft = sigRect.left - containerRect.left;
        const sigTop = sigRect.top - containerRect.top;
        
        newWidth = Math.min(Math.max(30, newWidth), containerRect.width - sigLeft - 5);
        // Recalculate height after constraining width
        newHeight = newWidth / aspectRatio;
        
        // Make sure height is also within bounds
        if (sigTop + newHeight > containerRect.height - 5) {
            // If height exceeds bounds, cap it and recalculate width
            newHeight = containerRect.height - sigTop - 5;
            newWidth = newHeight * aspectRatio;
        }
        
        // Update size
        signatureElement.style.width = `${newWidth}px`;
        signatureElement.style.height = `${newHeight}px`;
    }
}

// Finalize signature and apply to PDF
function finalizeSignature() {
    if (!signatureElement) return;
    
    // Show loading notification  
    showNotification('सिग्नेचर जोड़ा जा रहा है...', 'info');

    try {
        // Get signature position relative to PDF container
        const pdfContainer = document.getElementById('pdf-container');
        const pdfRect = pdfContainer.getBoundingClientRect();
        const sigRect = signatureElement.getBoundingClientRect();
        
        // Calculate position as percentage of PDF dimensions
        const relativeX = (sigRect.left - pdfRect.left) / pdfRect.width;
        const relativeY = (sigRect.top - pdfRect.top) / pdfRect.height;
        const relativeWidth = sigRect.width / pdfRect.width;
        
        // Get aspect ratio
        const aspectRatio = parseFloat(signatureElement.dataset.aspectRatio) || 1;
        
        console.log("Signature position (finalize):", { 
            relativeX, 
            relativeY, 
            relativeWidth, 
            aspectRatio,
            sigRect, 
            pdfRect 
        });
        
        // Remove draggable signature immediately to prevent visual issues
        removeDraggableSignature();
        
        // Use jsPDF to add signature directly
        const { jsPDF } = window.jspdf;
        
        // Set page format based on settings
        const options = {
            orientation: 'portrait',
            unit: 'mm',
            format: pdfFormat !== 'auto' ? pdfFormat : 'a4'
        };
        
        // Create a new PDF from the current one
        const pdf = new jsPDF(options);
        
        // Get dimensions
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();
        
        // Load all pages from current PDF
        const reader = new FileReader();
        reader.readAsArrayBuffer(currentPdfBlob);
        
        reader.onload = async function(e) {
            try {
                const pdfData = new Uint8Array(e.target.result);
                const pdfDoc = await pdfjsLib.getDocument({data: pdfData}).promise;
                const totalPages = pdfDoc.numPages;
                
                // Get current visible page (default to page 1)
                const currentPage = window.currentVisiblePage || 1;
                
                // Process each page
                for (let i = 1; i <= totalPages; i++) {
                    // Add a new page if not the first one
                    if (i > 1) {
                        pdf.addPage();
                    }
                    
                    const page = await pdfDoc.getPage(i);
                    const viewport = page.getViewport({scale: 1.5});
                    
                    // Create canvas for the page
                    const canvas = document.createElement('canvas');
                    const context = canvas.getContext('2d');
                    canvas.width = viewport.width;
                    canvas.height = viewport.height;
                    
                    // Render the page to the canvas
                    await page.render({
                        canvasContext: context,
                        viewport: viewport
                    }).promise;
                    
                    // Add the page content to the PDF
                    pdf.addImage(
                        canvas.toDataURL('image/jpeg', 0.8),
                        'JPEG',
                        0,
                        0,
                        pdfWidth,
                        pdfHeight,
                        null,
                        'FAST'
                    );
                    
                    // Add signature to current page only
                    if (i === currentPage) {
                        // Calculate signature dimensions in mm
                        const sigWidth = pdfWidth * relativeWidth;
                        const sigHeight = sigWidth / aspectRatio;
                        
                        // Calculate position - convert relative position to mm
                        const xPos = pdfWidth * relativeX;
                        const yPos = pdfHeight * relativeY;
                        
                        console.log("Adding signature at (mm):", {
                            x: xPos,
                            y: yPos,
                            width: sigWidth,
                            height: sigHeight
                        });
                        
                        // Add signature image with transparency
                        pdf.addImage(
                            signatureImage,
                            'PNG',
                            xPos,
                            yPos,
                            sigWidth,
                            sigHeight
                        );
                    }
                }
                
                // Save the new PDF
                currentPdfBlob = pdf.output('blob');
                
                // Update iframe
                const pdfUrl = URL.createObjectURL(currentPdfBlob);
                pdfIframe.src = pdfUrl;
                
                // Show success notification
                showNotification('सिग्नेचर सफलतापूर्वक जोड़ा गया', 'success');
                
            } catch (error) {
                console.error('PDF प्रोसेसिंग में त्रुटि:', error);
                showNotification('सिग्नेचर जोड़ने में समस्या हुई', 'error');
            }
        };
        
        reader.onerror = function(error) {
            console.error('PDF फाइल पढ़ने में त्रुटि:', error);
            showNotification('सिग्नेचर जोड़ने में समस्या हुई', 'error');
        };
        
    } catch (error) {
        console.error('सिग्नेचर फाइनलाइज़ में त्रुटि:', error);
        showNotification('सिग्नेचर जोड़ने में समस्या हुई', 'error');
    }
}

// Remove draggable signature
function removeDraggableSignature() {
    if (signatureElement && signatureElement.parentNode) {
        signatureElement.parentNode.removeChild(signatureElement);
        signatureElement = null;
    }
}

// Import signature from file
function importSignature() {
    // Create file input
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/*';
    fileInput.style.display = 'none';
    document.body.appendChild(fileInput);
    
    // Add event listener for file selection
    fileInput.addEventListener('change', function(e) {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            
            // Check if file is an image
            if (!file.type.match('image.*')) {
                showNotification('कृपया एक इमेज फाइल चुनें', 'error');
                return;
            }
            
            // Show loading notification
            showNotification('सिग्नेचर लोड हो रहा है...', 'info');
            
            const reader = new FileReader();
            
            reader.onload = function(event) {
                // Create image object
                const img = new Image();
                
                img.onload = function() {
                    try {
                        // Setup canvas if not already done
                        if (!signatureCtx) {
                            setupSignatureCanvas();
                        }
                        
                        // Clear existing signature
                        clearSignature();
                        
                        // Get canvas dimensions
                        const canvas = signatureCanvas;
                        const canvasWidth = canvas.width;
                        const canvasHeight = canvas.height;
                        
                        // Calculate image dimensions to fit canvas
                        const imgRatio = img.width / img.height;
                        
                        let drawWidth = canvasWidth * 0.9;
                        let drawHeight = drawWidth / imgRatio;
                        
                        if (drawHeight > canvasHeight * 0.9) {
                            drawHeight = canvasHeight * 0.9;
                            drawWidth = drawHeight * imgRatio;
                        }
                        
                        // Calculate position to center
                        const xPos = (canvasWidth - drawWidth) / 2;
                        const yPos = (canvasHeight - drawHeight) / 2;
                        
                        // Draw image on canvas with transparency
                        signatureCtx.clearRect(0, 0, canvasWidth, canvasHeight);
                        signatureCtx.drawImage(img, xPos, yPos, drawWidth, drawHeight);
                        
                        // Mark as having signature
                        hasSignature = true;
                        
                        // Apply current filter to the imported signature
                        if (currentSignatureFilter !== 'normal') {
                            applySignatureFilter(currentSignatureFilter);
                        } else {
                            // Save signature image data if no filter
                            signatureImage = canvas.toDataURL('image/png');
                        }
                        
                        // Show success notification
                        showNotification('सिग्नेचर इम्पोर्ट किया गया', 'success');
                        
                    } catch (error) {
                        console.error('Error importing signature:', error);
                        showNotification('सिग्नेचर इम्पोर्ट में समस्या हुई', 'error');
                    }
                };
                
                img.onerror = function() {
                    console.error('Error loading image');
                    showNotification('इमेज लोड करने में समस्या हुई', 'error');
                };
                
                img.src = event.target.result;
            };
            
            reader.onerror = function() {
                console.error('Error reading file');
                showNotification('फाइल पढ़ने में समस्या हुई', 'error');
            };
            
            reader.readAsDataURL(file);
        }
    });
    
    // Trigger file input dialog
    fileInput.click();
    
    // Remove the file input after use
    setTimeout(function() {
        if (document.body.contains(fileInput)) {
            document.body.removeChild(fileInput);
        }
    }, 5000);
}

// Initialize the app when document is loaded
document.addEventListener('DOMContentLoaded', initApp); 

// Add function to track current visible page
// Listen for iframe load to detect page changes
pdfIframe.onload = function() {
    try {
        const iframe = document.getElementById('pdf-iframe');
        if (iframe && iframe.contentWindow) {
            // Set initial page
            window.currentVisiblePage = 1;
            
            // Try to detect page changes in the PDF viewer
            iframe.contentWindow.addEventListener('scroll', function() {
                // This is a simplistic approach - we'll update page info based on scroll position
                if (window.totalPdfPages > 1) {
                    const scrollPos = iframe.contentWindow.scrollY;
                    const totalHeight = iframe.contentDocument.body.scrollHeight;
                    const viewportHeight = iframe.contentWindow.innerHeight;
                    
                    // Estimate current page based on scroll position
                    const scrollRatio = scrollPos / (totalHeight - viewportHeight);
                    const estimatedPage = Math.min(
                        Math.max(1, Math.ceil(scrollRatio * window.totalPdfPages)),
                        window.totalPdfPages
                    );
                    
                    // Update current visible page for signature placement
                    window.currentVisiblePage = estimatedPage;
                    
                    updatePdfPageInfo(estimatedPage, window.totalPdfPages);
                }
            });
        }
    } catch (error) {
        console.log('Could not add page change detection', error);
    }
}; 

// Start signature dragging
function startSignatureDrag(e) {
    // Only handle primary mouse button (left click)
    if (e.button !== 0) return;
    
    // Don't start drag if clicking on the resize handle or buttons
    if (e.target.className === 'resize-handle' || 
        e.target.tagName === 'BUTTON' ||
        e.target.parentElement.tagName === 'BUTTON') return;
    
    e.preventDefault();
    signatureDragging = true;
    
    // Get the container bounds for relative positioning
    const pdfContainer = document.getElementById('pdf-container');
    const containerRect = pdfContainer.getBoundingClientRect();
    
    // Calculate offset of mouse within the signature element
    const sigRect = signatureElement.getBoundingClientRect();
    const offsetX = e.clientX - sigRect.left;
    const offsetY = e.clientY - sigRect.top;
    
    // Store information needed for dragging
    initialMousePos = {
        x: e.clientX,
        y: e.clientY,
        offsetX: offsetX,
        offsetY: offsetY,
        containerLeft: containerRect.left,
        containerTop: containerRect.top
    };
    
    // Highlight that dragging is active
    signatureElement.style.opacity = "0.8";
    signatureElement.style.boxShadow = "0 0 10px rgba(0, 123, 255, 0.5)";
}

// Start signature dragging (touch)
function startSignatureDragTouch(e) {
    // Prevent default behavior like scrolling
    e.preventDefault();
    
    // Don't start drag if touching the resize handle or buttons
    if (e.target.className === 'resize-handle' || 
        e.target.tagName === 'BUTTON' ||
        e.target.parentElement.tagName === 'BUTTON') return;
    
    signatureDragging = true;
    
    // Get the container bounds for relative positioning
    const pdfContainer = document.getElementById('pdf-container');
    const containerRect = pdfContainer.getBoundingClientRect();
    
    // Get touch position
    const touch = e.touches[0];
    
    // Calculate offset of touch within the signature element
    const sigRect = signatureElement.getBoundingClientRect();
    const offsetX = touch.clientX - sigRect.left;
    const offsetY = touch.clientY - sigRect.top;
    
    // Store information needed for dragging
    initialMousePos = {
        x: touch.clientX,
        y: touch.clientY,
        offsetX: offsetX,
        offsetY: offsetY,
        containerLeft: containerRect.left,
        containerTop: containerRect.top
    };
    
    // Highlight that dragging is active
    signatureElement.style.opacity = "0.8";
    signatureElement.style.boxShadow = "0 0 10px rgba(0, 123, 255, 0.5)";
}

// Stop signature drag/resize
function stopSignatureDrag() {
    signatureDragging = false;
    signatureResizing = false;
    
    // Reset visual cues
    if (signatureElement) {
        signatureElement.style.opacity = "1";
        signatureElement.style.boxShadow = "none";
    }
}

// Start signature resizing
function startSignatureResize(e) {
    e.preventDefault();
    e.stopPropagation();
    signatureResizing = true;
    signatureDragging = false;
    
    // Store initial mouse position
    initialMousePos.x = e.clientX;
    initialMousePos.y = e.clientY;
    
    // Store initial signature size
    initialSignatureSize.width = signatureElement.offsetWidth;
    initialSignatureSize.height = signatureElement.offsetHeight;
    
    // Add resize visual cue
    signatureElement.style.boxShadow = "0 0 10px rgba(40, 167, 69, 0.5)";
}

// Start signature resizing (touch)
function startSignatureResizeTouch(e) {
    e.preventDefault();
    e.stopPropagation();
    signatureResizing = true;
    signatureDragging = false;
    
    // Store initial touch position
    const touch = e.touches[0];
    initialMousePos.x = touch.clientX;
    initialMousePos.y = touch.clientY;
    
    // Store initial signature size
    initialSignatureSize.width = signatureElement.offsetWidth;
    initialSignatureSize.height = signatureElement.offsetHeight;
    
    // Add resize visual cue
    signatureElement.style.boxShadow = "0 0 10px rgba(40, 167, 69, 0.5)";
}

// Apply filter to signature
function applySignatureFilter(filter) {
    // Remove active class from all filter buttons
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Add active class to selected filter button
    document.getElementById(`${filter}-filter`).classList.add('active');
    
    // Save current filter
    currentSignatureFilter = filter;
    
    // Apply filter to canvas
    const canvas = signatureCanvas;
    
    // Remove all filter classes
    canvas.classList.remove('canvas-bw', 'canvas-contrast', 'canvas-invert');
    
    // Apply selected filter
    switch (filter) {
        case 'bw':
            canvas.classList.add('canvas-bw');
            break;
        case 'contrast':
            canvas.classList.add('canvas-contrast');
            break;
        case 'invert':
            canvas.classList.add('canvas-invert');
            break;
        // normal case doesn't need a class
    }
    
    // If we have a signature, update the signature image with the filter
    if (hasSignature) {
        updateSignatureWithFilter();
    }
}

// Function to update signature image with current filter
function updateSignatureWithFilter() {
    if (!hasSignature || !signatureCtx) return;
    
    // Get original signature data
    const originalImageData = signatureCanvas.toDataURL('image/png');
    
    // Create a temporary canvas to apply the filter
    const tempCanvas = document.createElement('canvas');
    const tempCtx = tempCanvas.getContext('2d');
    tempCanvas.width = signatureCanvas.width;
    tempCanvas.height = signatureCanvas.height;
    
    // Create an image to draw on the temp canvas
    const img = new Image();
    img.onload = function() {
        // Draw the original image
        tempCtx.clearRect(0, 0, tempCanvas.width, tempCanvas.height);
        tempCtx.drawImage(img, 0, 0);
        
        // Apply filters if needed (using canvas API for more control)
        if (currentSignatureFilter !== 'normal') {
            const imageData = tempCtx.getImageData(0, 0, tempCanvas.width, tempCanvas.height);
            const data = imageData.data;
            
            switch (currentSignatureFilter) {
                case 'bw':
                    for (let i = 0; i < data.length; i += 4) {
                        if (data[i+3] > 0) { // Only process non-transparent pixels
                            const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
                            const val = avg > 128 ? 255 : 0;
                            data[i] = val;     // R
                            data[i + 1] = val; // G
                            data[i + 2] = val; // B
                        }
                    }
                    break;
                case 'contrast':
                    for (let i = 0; i < data.length; i += 4) {
                        if (data[i+3] > 0) { // Only process non-transparent pixels
                            data[i] = Math.min(255, Math.max(0, (data[i] - 128) * 1.5 + 128));       // R
                            data[i + 1] = Math.min(255, Math.max(0, (data[i + 1] - 128) * 1.5 + 128)); // G
                            data[i + 2] = Math.min(255, Math.max(0, (data[i + 2] - 128) * 1.5 + 128)); // B
                        }
                    }
                    break;
                case 'invert':
                    for (let i = 0; i < data.length; i += 4) {
                        if (data[i+3] > 0) { // Only process non-transparent pixels
                            data[i] = 255 - data[i];       // R
                            data[i + 1] = 255 - data[i + 1]; // G
                            data[i + 2] = 255 - data[i + 2]; // B
                        }
                    }
                    break;
            }
            
            tempCtx.putImageData(imageData, 0, 0);
        }
        
        // Update signature image with filtered version
        signatureImage = tempCanvas.toDataURL('image/png');
    };
    
    img.src = originalImageData;
}