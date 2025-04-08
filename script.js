document.addEventListener('DOMContentLoaded', (event) => {

    // Dark mode toggle
    const darkModeToggle = document.getElementById('darkModeToggle');
    if (darkModeToggle) {
        darkModeToggle.addEventListener('click', function() {
            document.documentElement.classList.toggle('dark');
            localStorage.setItem('darkMode', document.documentElement.classList.contains('dark'));
        });
    }

    // Check for saved dark mode preference
    if (localStorage.getItem('darkMode') === 'true') {
        document.documentElement.classList.add('dark');
    }

    // Calculate thyroid lobe volume
    function calculateVolume(side) {
        const lengthInput = document.querySelector(`.measurement[data-side="${side}"][data-dim="length"]`);
        const widthInput = document.querySelector(`.measurement[data-side="${side}"][data-dim="width"]`);
        const heightInput = document.querySelector(`.measurement[data-side="${side}"][data-dim="height"]`);
        const volumeOutput = document.getElementById(`${side}Volume`);

        if (!lengthInput || !widthInput || !heightInput || !volumeOutput) return;

        const length = parseFloat(lengthInput.value) || 0;
        const width = parseFloat(widthInput.value) || 0;
        const height = parseFloat(heightInput.value) || 0;

        // Volume formula: length × width × height × π/6 (ellipsoid formula approx. 0.523)
        const volume = (length * width * height * 0.523).toFixed(1);
        volumeOutput.value = volume + ' ml';

        updateReportPreview();
    }

    // Add event listeners for volume calculations
    document.querySelectorAll('.measurement').forEach(input => {
        input.addEventListener('input', function() {
            calculateVolume(this.dataset.side);
        });
    });

    // Lymph node status toggle
    document.querySelectorAll('input[name="lymph_status"]').forEach(radio => {
        radio.addEventListener('change', function() {
            const abnormalFields = document.getElementById('abnormalLymphFields');
            if (abnormalFields) {
                abnormalFields.classList.toggle('hidden', this.value !== 'abnormal');
            }
            updateReportPreview();
        });
    });

    // Quick findings buttons
    document.querySelectorAll('.quick-finding').forEach(button => {
        button.addEventListener('click', function() {
            const findingsTextarea = document.querySelector('textarea[placeholder="Describe any additional findings..."]');
            if (findingsTextarea) {
                findingsTextarea.value += (findingsTextarea.value ? '\n' : '') + this.dataset.text;
                updateReportPreview();
            }
        });
    });

    // Nodule management
    let noduleCount = 0;
    const noduleList = document.getElementById('noduleList');
    const initialNoNodulesMessage = document.getElementById('noNodulesMessage'); // Store the template
    const tiradsSection = document.getElementById('tiradsSection');
    const noNoduleTirads = document.getElementById('noNoduleTirads');
    const selectedNoduleName = document.getElementById('selectedNoduleName');
    const addNoduleBtn = document.getElementById('addNoduleBtn');
    const diagram = document.querySelector('.thyroid-diagram');

    if (addNoduleBtn) {
        addNoduleBtn.addEventListener('click', function() {
            noduleCount++;
            const noduleId = `nodule-${noduleCount}`;

            const noduleDiv = document.createElement('div');
            noduleDiv.className = 'border rounded p-4 bg-gray-50 dark:bg-gray-700 nodule-entry'; // Added class for selection
            noduleDiv.id = noduleId;
            noduleDiv.dataset.noduleId = noduleId;
            noduleDiv.dataset.noduleNumber = noduleCount;

            noduleDiv.innerHTML = `
                <div class="flex justify-between items-center mb-2">
                    <h3 class="font-medium">Nodule ${noduleCount}</h3>
                    <button class="text-red-600 hover:text-red-800 dark:hover:text-red-400 delete-nodule" data-nodule="${noduleId}" title="Delete Nodule">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>

                <div class="grid grid-cols-2 gap-4 mb-2">
                    <div>
                        <label class="block text-xs font-medium mb-1">Location</label>
                        <select class="w-full px-2 py-1 border rounded dark:bg-gray-700 dark:border-gray-600 nodule-location">
                            <option value="right_upper">Right lobe - upper</option>
                            <option value="right_mid">Right lobe - mid</option>
                            <option value="right_lower">Right lobe - lower</option>
                            <option value="left_upper">Left lobe - upper</option>
                            <option value="left_mid">Left lobe - mid</option>
                            <option value="left_lower">Left lobe - lower</option>
                            <option value="isthmus">Isthmus</option>
                        </select>
                    </div>
                    <div>
                        <label class="block text-xs font-medium mb-1">Position</label>
                        <select class="w-full px-2 py-1 border rounded dark:bg-gray-700 dark:border-gray-600 nodule-position">
                             <option value="">N/A</option>
                            <option value="ant">Anterior</option>
                            <option value="post">Posterior</option>
                            <option value="med">Medial</option>
                            <option value="lat">Lateral</option>
                            <option value="ant_med">Anterior-medial</option>
                            <option value="ant_lat">Anterior-lateral</option>
                            <option value="post_med">Posterior-medial</option>
                            <option value="post_lat">Posterior-lateral</option>
                        </select>
                    </div>
                </div>

                <div class="grid grid-cols-3 gap-2 mb-2">
                    <div>
                        <label class="block text-xs font-medium mb-1">Length (cm)</label>
                        <input type="number" step="0.1" min="0" class="w-full px-2 py-1 border rounded dark:bg-gray-700 dark:border-gray-600 nodule-dimension" data-dim="length">
                    </div>
                    <div>
                        <label class="block text-xs font-medium mb-1">Width (cm)</label>
                        <input type="number" step="0.1" min="0" class="w-full px-2 py-1 border rounded dark:bg-gray-700 dark:border-gray-600 nodule-dimension" data-dim="width">
                    </div>
                    <div>
                        <label class="block text-xs font-medium mb-1">Height (cm)</label>
                        <input type="number" step="0.1" min="0" class="w-full px-2 py-1 border rounded dark:bg-gray-700 dark:border-gray-600 nodule-dimension" data-dim="height">
                    </div>
                </div>

                <div class="mb-2">
                    <label class="block text-xs font-medium mb-1">Max Dimension (cm)</label>
                    <input type="text" class="w-full px-2 py-1 border rounded dark:bg-gray-700 dark:border-gray-600 bg-gray-100 dark:bg-gray-600 nodule-max-dim" readonly>
                </div>

                <button class="w-full mt-2 px-2 py-1 bg-indigo-600 text-white rounded hover:bg-indigo-700 text-sm select-nodule-btn" data-nodule="${noduleId}">
                    Select for TI-RADS
                </button>
            `;

            const existingNoNodules = document.getElementById('noNodulesMessage');
            if (existingNoNodules) {
                existingNoNodules.remove();
            }

            if (noduleList) {
                noduleList.appendChild(noduleDiv);
            }

            // Add nodule marker to diagram
            addNoduleMarker(noduleId, noduleCount);

            // Set up event listeners for this nodule
            setupNoduleEvents(noduleId);

            // Automatically select the new nodule
            selectNodule(noduleId);

            updateReportPreview();
        });
    }

    function addNoduleMarker(noduleId, noduleNumber) {
        if (!diagram) return;
        const marker = document.createElement('div');
        marker.className = 'nodule-marker';
        marker.id = `marker-${noduleId}`;
        marker.dataset.noduleId = noduleId;
        marker.textContent = noduleNumber; // Display number on marker
        marker.style.fontSize = '8px';
        marker.style.color = 'white';
        marker.style.textAlign = 'center';
        marker.style.lineHeight = '12px';
        marker.title = `Nodule ${noduleNumber}`;

        // Set initial position (semi-random within diagram bounds)
        const diagramRect = diagram.getBoundingClientRect();
        const markerSize = 12;
        // Random position within the lobes, avoiding edges too much
        const left = markerSize + Math.random() * (diagramRect.width - 2 * markerSize);
        const top = markerSize + Math.random() * (diagramRect.height - 2 * markerSize - 20); // Avoid bottom part
        marker.style.left = `${left}px`;
        marker.style.top = `${top}px`;

        diagram.appendChild(marker);

        // Make marker draggable
        makeDraggable(marker);

        // Add click event to select nodule
        marker.addEventListener('click', function(e) {
            e.stopPropagation(); // Prevent triggering diagram click if any
            selectNodule(noduleId);
        });
        // Initial update based on default location
        updateNoduleMarkerStyle(noduleId);
    }

    function makeDraggable(element) {
        let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
        const diagramElement = element.parentElement; // The thyroid-diagram div

        element.onmousedown = dragMouseDown;

        function dragMouseDown(e) {
            e = e || window.event;
            e.preventDefault();
            pos3 = e.clientX;
            pos4 = e.clientY;
            document.onmouseup = closeDragElement;
            document.onmousemove = elementDrag;
        }

        function elementDrag(e) {
            e = e || window.event;
            e.preventDefault();
            pos1 = pos3 - e.clientX;
            pos2 = pos4 - e.clientY;
            pos3 = e.clientX;
            pos4 = e.clientY;

            const diagramRect = diagramElement.getBoundingClientRect();
            const elementRect = element.getBoundingClientRect();

            // Calculate new position relative to the diagram parent
            let newTop = element.offsetTop - pos2;
            let newLeft = element.offsetLeft - pos1;

             // Boundary checks (relative to parent)
            const parentWidth = diagramElement.offsetWidth;
            const parentHeight = diagramElement.offsetHeight;
            const elementWidth = element.offsetWidth;
            const elementHeight = element.offsetHeight;

            // Ensure marker stays within bounds (consider transform offset)
            const offsetX = 6; // from transform: translate(-6px, -6px);
            const offsetY = 6;

            newLeft = Math.max(offsetX, Math.min(newLeft, parentWidth - elementWidth + offsetX));
            newTop = Math.max(offsetY, Math.min(newTop, parentHeight - elementHeight + offsetY));


            element.style.top = newTop + "px";
            element.style.left = newLeft + "px";
        }

        function closeDragElement() {
            document.onmouseup = null;
            document.onmousemove = null;
        }
    }

    function setupNoduleEvents(noduleId) {
        const noduleDiv = document.getElementById(noduleId);
        if (!noduleDiv) return;

        // Delete button
        noduleDiv.querySelector('.delete-nodule').addEventListener('click', function() {
            if (confirm(`Are you sure you want to delete Nodule ${noduleDiv.dataset.noduleNumber}?`)) {
                const marker = document.getElementById(`marker-${noduleId}`);
                if (marker) marker.remove();
                noduleDiv.remove();

                // If no nodules left, show message
                if (noduleList && noduleList.children.length === 0 && initialNoNodulesMessage) {
                     const noMsg = initialNoNodulesMessage.cloneNode(true); // Clone the template
                     noMsg.id = 'noNodulesMessage'; // Ensure it has the ID
                     noduleList.appendChild(noMsg);
                }

                // If deleted nodule was selected, clear TI-RADS
                if (tiradsSection && tiradsSection.dataset.selectedNodule === noduleId) {
                    clearTiradsSelection();
                }

                // Renumber remaining nodules (visually only for now)
                renumberNodules();
                updateReportPreview();
            }
        });

        // Dimension inputs - calculate max dimension and volume
        noduleDiv.querySelectorAll('.nodule-dimension').forEach(input => {
            input.addEventListener('input', function() {
                calculateNoduleMaxDim(noduleId);
                 // updateTiradsScore(); // Recalculate recommendations if size changes
                 // updateRecommendations uses size, so call it indirectly via updateTiradsScore or directly
                 if(tiradsSection && tiradsSection.dataset.selectedNodule === noduleId) {
                    updateTiradsScore();
                 }
            });
        });

        // Location changes - update marker color/style
        noduleDiv.querySelector('.nodule-location').addEventListener('change', function() {
            updateNoduleMarkerStyle(noduleId);
        });

        // Select for TI-RADS button
        noduleDiv.querySelector('.select-nodule-btn').addEventListener('click', function() {
            selectNodule(noduleId);
        });

         // Calculate initial Max Dim
         calculateNoduleMaxDim(noduleId);
    }

     function clearTiradsSelection() {
        if (tiradsSection) {
            tiradsSection.classList.add('hidden');
            delete tiradsSection.dataset.selectedNodule; // Clear selected nodule tracker
        }
        if (noNoduleTirads) {
            noNoduleTirads.classList.remove('hidden');
        }
        if (selectedNoduleName) {
            selectedNoduleName.textContent = 'No nodule selected';
        }
        // Clear selection highlight from markers and entries
         document.querySelectorAll('.nodule-marker.selected').forEach(m => m.classList.remove('selected'));
         document.querySelectorAll('.nodule-entry.selected-entry').forEach(e => e.classList.remove('selected-entry'));
        // Optionally reset TI-RADS form fields
        // resetTiradsForm();
        updateReportPreview(); // Update impression based on deselection
    }

    function selectNodule(noduleId) {
        const noduleDiv = document.getElementById(noduleId);
        const marker = document.getElementById(`marker-${noduleId}`);

        if (!noduleDiv || !marker) {
            console.error("Cannot select nodule:", noduleId);
            return;
        }

        // Update UI markers: Remove selection from others, add to current
        document.querySelectorAll('.nodule-marker.selected').forEach(m => m.classList.remove('selected'));
        marker.classList.add('selected');

        // Update UI entries: Remove selection highlight from others, add to current
         document.querySelectorAll('.nodule-entry.selected-entry').forEach(e => e.classList.remove('selected-entry', 'ring-2', 'ring-indigo-500'));
        noduleDiv.classList.add('selected-entry', 'ring-2', 'ring-indigo-500'); // Highlight selected entry


        // Update TI-RADS section
        if (tiradsSection && selectedNoduleName && noNoduleTirads) {
            tiradsSection.dataset.selectedNodule = noduleId;
            selectedNoduleName.textContent = `Nodule ${noduleDiv.dataset.noduleNumber}`;
            tiradsSection.classList.remove('hidden');
            noNoduleTirads.classList.add('hidden');

             // Populate TI-RADS form with stored data for this nodule or reset if none
            loadNoduleTiradsData(noduleId);

             // Calculate and display current TI-RADS score
            updateTiradsScore();

            // Scroll to TI-RADS section if needed
            // tiradsSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        } else {
            console.error("TI-RADS section elements not found");
        }
         updateReportPreview(); // Update impression
    }

    // Placeholder for loading/saving TI-RADS data per nodule
    function loadNoduleTiradsData(noduleId) {
        const noduleDiv = document.getElementById(noduleId);
        if (!noduleDiv || !tiradsSection) return;

        // Example: Retrieve stored data (if implemented) or reset form
        const savedData = JSON.parse(noduleDiv.dataset.tiradsData || '{}');

        tiradsSection.querySelectorAll('select.tirads-option').forEach(select => {
            select.value = savedData[select.previousElementSibling.textContent.trim()] || select.options[0].value; // Use label text as key (crude) or add data attributes
        });
        tiradsSection.querySelectorAll('.tirads-option[type="checkbox"]').forEach(checkbox => {
            checkbox.checked = savedData[checkbox.value] || false; // Use checkbox value as key
        });

        // After loading, recalculate
        updateTiradsScore();
    }

    function saveNoduleTiradsData(noduleId) {
         const noduleDiv = document.getElementById(noduleId);
        if (!noduleDiv || !tiradsSection) return;

        const data = {};
        tiradsSection.querySelectorAll('select.tirads-option').forEach(select => {
            // Using label text as key is fragile, prefer data attributes if possible
             const key = select.previousElementSibling?.textContent.trim() || select.id || select.name; // Try to get a meaningful key
            data[key] = select.value;
        });
        tiradsSection.querySelectorAll('.tirads-option[type="checkbox"]').forEach(checkbox => {
             const key = checkbox.value; // Use checkbox value as key
            data[key] = checkbox.checked;
        });

        noduleDiv.dataset.tiradsData = JSON.stringify(data);
    }


    function calculateNoduleMaxDim(noduleId) {
        const noduleDiv = document.getElementById(noduleId);
        if (!noduleDiv) return;

        const length = parseFloat(noduleDiv.querySelector('.nodule-dimension[data-dim="length"]').value) || 0;
        const width = parseFloat(noduleDiv.querySelector('.nodule-dimension[data-dim="width"]').value) || 0;
        const height = parseFloat(noduleDiv.querySelector('.nodule-dimension[data-dim="height"]').value) || 0;

        const maxDim = Math.max(length, width, height).toFixed(1);
        const maxDimInput = noduleDiv.querySelector('.nodule-max-dim');
        if (maxDimInput) {
             maxDimInput.value = maxDim > 0 ? maxDim + ' cm' : '';
        }

        updateReportPreview();
    }

    function updateNoduleMarkerStyle(noduleId) {
        const noduleDiv = document.getElementById(noduleId);
        const marker = document.getElementById(`marker-${noduleId}`);
        if (!noduleDiv || !marker) return;

        const location = noduleDiv.querySelector('.nodule-location').value;

        // Reset base style, keep 'selected' if present
        const isSelected = marker.classList.contains('selected');
        marker.className = 'nodule-marker'; // Reset classes
        if (isSelected) marker.classList.add('selected');

         // Remove previous TI-RADS color classes
         marker.classList.remove('tr1', 'tr2', 'tr3', 'tr4', 'tr5');

        // Default/Location based color (before TI-RADS calculation)
        if (location.includes('right')) {
            marker.style.backgroundColor = '#2196F3'; // Blue for right lobe
        } else if (location.includes('left')) {
            marker.style.backgroundColor = '#4CAF50'; // Green for left lobe
        } else if (location === 'isthmus') {
            marker.style.backgroundColor = '#FF9800'; // Orange for isthmus
        } else {
             marker.style.backgroundColor = '#ff5722'; // Default red/orange
        }

        // If this nodule is currently selected for TI-RADS, re-apply the TI-RADS color
        if (tiradsSection && tiradsSection.dataset.selectedNodule === noduleId) {
            const tiradsLevel = document.getElementById('tiradsLevel')?.textContent.toLowerCase();
             if (tiradsLevel && tiradsLevel !== 'tr?') { // Check if a valid level is set
                marker.classList.add(tiradsLevel);
                 marker.style.backgroundColor = ''; // Let the class handle the color
            }
        }
    }

     function renumberNodules() {
        const noduleEntries = noduleList.querySelectorAll('.nodule-entry');
        let currentNumber = 1;
        noduleEntries.forEach(entry => {
            const noduleId = entry.id;
            const marker = document.getElementById(`marker-${noduleId}`);

            // Update entry title
            entry.querySelector('h3').textContent = `Nodule ${currentNumber}`;
            entry.dataset.noduleNumber = currentNumber; // Update data attribute

            // Update marker text and title
            if (marker) {
                marker.textContent = currentNumber;
                marker.title = `Nodule ${currentNumber}`;
            }

            // Update selected nodule name if this one is selected
            if (tiradsSection && tiradsSection.dataset.selectedNodule === noduleId && selectedNoduleName) {
                 selectedNoduleName.textContent = `Nodule ${currentNumber}`;
            }

            currentNumber++;
        });
        noduleCount = currentNumber - 1; // Reset the main counter
    }

    // TI-RADS calculation
    if (tiradsSection) {
        tiradsSection.querySelectorAll('.tirads-option').forEach(option => {
            option.addEventListener('change', updateTiradsScore);
        });
    }

    function updateTiradsScore() {
        if (!tiradsSection || !tiradsSection.dataset.selectedNodule) return; // Only calculate if a nodule is selected

        let totalPoints = 0;
        const pointsDetails = {}; // To store points per category for potential debugging/display

        // Composition
        const compositionSelect = tiradsSection.querySelector('select.tirads-option[data-points]'); // Assuming first select is composition
        const compositionOption = compositionSelect.options[compositionSelect.selectedIndex];
        totalPoints += parseInt(compositionOption.dataset.points) || 0;
        pointsDetails['Composition'] = parseInt(compositionOption.dataset.points) || 0;

        // Echogenicity
        const echogenicitySelect = tiradsSection.querySelectorAll('select.tirads-option[data-points]')[1]; // Assuming second
        const echogenicityOption = echogenicitySelect.options[echogenicitySelect.selectedIndex];
        totalPoints += parseInt(echogenicityOption.dataset.points) || 0;
         pointsDetails['Echogenicity'] = parseInt(echogenicityOption.dataset.points) || 0;

        // Shape
        const shapeSelect = tiradsSection.querySelectorAll('select.tirads-option[data-points]')[2]; // Assuming third
        const shapeOption = shapeSelect.options[shapeSelect.selectedIndex];
        totalPoints += parseInt(shapeOption.dataset.points) || 0;
         pointsDetails['Shape'] = parseInt(shapeOption.dataset.points) || 0;

        // Margin
        const marginSelect = tiradsSection.querySelectorAll('select.tirads-option[data-points]')[3]; // Assuming fourth
        const marginOption = marginSelect.options[marginSelect.selectedIndex];
        totalPoints += parseInt(marginOption.dataset.points) || 0;
        pointsDetails['Margin'] = parseInt(marginOption.dataset.points) || 0;

        // Echogenic Foci (handle checkboxes - sum points, max 3 points from this category)
        let fociPoints = 0;
         const fociCheckboxes = tiradsSection.querySelectorAll('input.tirads-option[type="checkbox"][data-group="echogenic_foci"]');
         fociCheckboxes.forEach(checkbox => {
            if (checkbox.checked) {
                // Check if it's the 'none' checkbox
                 if (checkbox.value === 'none') {
                    // If 'none' is checked, potentially uncheck others
                    fociCheckboxes.forEach(cb => { if (cb !== checkbox) cb.checked = false; });
                    fociPoints = 0; // Reset points if 'none' is explicitly selected
                    return; // Exit loop early for this category
                } else {
                    // Uncheck 'none' if any other foci option is selected
                    const noneCheckbox = tiradsSection.querySelector('input.tirads-option[value="none"]');
                    if (noneCheckbox) noneCheckbox.checked = false;
                    fociPoints += parseInt(checkbox.dataset.points) || 0;
                }
            }
         });
         // ACR TI-RADS sums points for foci, doesn't cap at 3 (that's a simplified view)
        totalPoints += fociPoints;
        pointsDetails['Echogenic Foci'] = fociPoints;

        // Update points display
        const tiradsPointsEl = document.getElementById('tiradsPoints');
        if (tiradsPointsEl) tiradsPointsEl.textContent = totalPoints;

        // Determine TI-RADS level
        let tiradsLevel = 'TR?'; // Default/Unknown
        let tiradsColor = ''; // CSS class for color
        let pointerPosition = '0%';

         // Check composition edge cases for TR1/TR2 determination regardless of points
         const compositionValue = compositionSelect.value;
         if (compositionValue === 'cystic' || compositionValue === 'spongiform') {
             tiradsLevel = 'TR1'; // TR1 regardless of other points if purely cystic/spongiform
             totalPoints = 0; // Force points to 0 for TR1 consistency
         }

        // Determine level based on points (if not already set to TR1 by composition)
         if (tiradsLevel === 'TR?') {
            if (totalPoints === 0) {
                tiradsLevel = 'TR1';
                tiradsColor = 'tr1';
                pointerPosition = '0%';
            } else if (totalPoints === 2) { // Note: TR2 is 2 points per ACR chart
                tiradsLevel = 'TR2';
                tiradsColor = 'tr2';
                pointerPosition = '25%';
             } else if (totalPoints === 3) { // Note: TR3 is 3 points per ACR chart
                tiradsLevel = 'TR3';
                tiradsColor = 'tr3';
                pointerPosition = '50%';
            } else if (totalPoints >= 4 && totalPoints <= 6) { // TR4 is 4-6 points
                tiradsLevel = 'TR4';
                tiradsColor = 'tr4';
                pointerPosition = '75%';
            } else if (totalPoints >= 7) { // TR5 is 7+ points
                tiradsLevel = 'TR5';
                tiradsColor = 'tr5';
                pointerPosition = '100%';
            }
            // Note: The original logic for TR2/TR3 points might differ slightly from strict ACR guidelines.
            // This implementation follows the ACR point ranges more closely. Adjust if needed based on specific requirements.
         } else { // TR1 determined by composition
             tiradsColor = 'tr1';
             pointerPosition = '0%';
         }


        const tiradsLevelEl = document.getElementById('tiradsLevel');
        if (tiradsLevelEl) tiradsLevelEl.textContent = tiradsLevel;

        // Update pointer position
        const pointer = document.querySelector('.tirads-pointer');
        if (pointer) pointer.style.left = pointerPosition;

        // Update selected nodule marker color and style
        const selectedNoduleId = tiradsSection.dataset.selectedNodule;
        if (selectedNoduleId) {
             updateNoduleMarkerStyle(selectedNoduleId); // Reuse the style update function
            // Save the calculated data back to the nodule element
            saveNoduleTiradsData(selectedNoduleId);
        }


        // Update recommendations based on the calculated level and nodule size
        updateRecommendations(tiradsLevel);
        updateAutoImpression(); // Update impression based on new score
        updateReportPreview(); // Ensure preview reflects changes
    }


    function updateRecommendations(tiradsLevel) {
        const recommendationsEl = document.getElementById('recommendations');
        if (!recommendationsEl) return;

        const selectedNoduleId = tiradsSection?.dataset.selectedNodule;
        if (!selectedNoduleId) {
            recommendationsEl.textContent = 'Select a nodule to see recommendations.';
            return;
        }

        const noduleDiv = document.getElementById(selectedNoduleId);
        if (!noduleDiv) return;

        // Use Max Dimension for recommendations
        const maxDimInput = noduleDiv.querySelector('.nodule-max-dim');
        const sizeCm = parseFloat(maxDimInput?.value) || 0; // Extract numeric value

        let recommendation = '';

        switch(tiradsLevel) {
            case 'TR1':
            case 'TR2':
                recommendation = 'Benign appearance. No FNA recommended.';
                break;
            case 'TR3': // 3 points
                if (sizeCm >= 2.5) {
                    recommendation = 'FNA if ≥ 2.5 cm. Follow-up if ≥ 1.5 cm.';
                } else if (sizeCm >= 1.5) {
                    recommendation = 'Follow-up if ≥ 1.5 cm. No FNA recommended based on size.';
                } else {
                    recommendation = 'No FNA or Follow-up recommended based on size.';
                }
                break;
            case 'TR4': // 4-6 points
                if (sizeCm >= 1.5) {
                    recommendation = 'FNA if ≥ 1.5 cm. Follow-up if ≥ 1.0 cm.';
                } else if (sizeCm >= 1.0) {
                    recommendation = 'Follow-up if ≥ 1.0 cm. No FNA recommended based on size.';
                } else {
                    recommendation = 'No FNA or Follow-up recommended based on size.';
                }
                break;
            case 'TR5': // 7+ points
                if (sizeCm >= 1.0) {
                    recommendation = 'FNA if ≥ 1.0 cm. Follow-up if ≥ 0.5 cm.';
                } else if (sizeCm >= 0.5) {
                    recommendation = 'Follow-up if ≥ 0.5 cm. No FNA recommended based on size.';
                } else {
                    recommendation = 'No FNA or Follow-up recommended based on size.';
                }
                break;
            default:
                 recommendation = 'Cannot determine recommendation. Calculate TI-RADS score.';
                 break;
        }

        recommendationsEl.textContent = recommendation;
    }


    function updateAutoImpression() {
        const autoImpressionEl = document.getElementById('autoImpression');
        if (!autoImpressionEl) return;

        const selectedNoduleId = tiradsSection?.dataset.selectedNodule;
        if (!selectedNoduleId) {
            autoImpressionEl.value = ''; // Clear if no nodule selected
            return;
        }

        const noduleDiv = document.getElementById(selectedNoduleId);
        if (!noduleDiv) return;

        const noduleNumber = noduleDiv.dataset.noduleNumber;
        const locationSelect = noduleDiv.querySelector('.nodule-location');
        const location = locationSelect.options[locationSelect.selectedIndex].text;

        const maxDimInput = noduleDiv.querySelector('.nodule-max-dim');
        const maxDimText = maxDimInput?.value || 'N/A'; // e.g., "1.2 cm"

        const tiradsLevel = document.getElementById('tiradsLevel')?.textContent || 'TR?';
        const recommendation = document.getElementById('recommendations')?.textContent || '';

        let impression = `Nodule ${noduleNumber} (${location}): Measuring ${maxDimText}. `;
        impression += `ACR TI-RADS ${tiradsLevel}.`;
        if (recommendation && recommendation.includes('FNA')) {
             impression += ` Recommendation: ${recommendation}`;
        } else if (recommendation && recommendation.includes('Follow-up')) {
            impression += ` Recommendation: ${recommendation}`;
        } else if (tiradsLevel !== 'TR1' && tiradsLevel !== 'TR2') {
             impression += ` No FNA indicated based on current size criteria.`;
        }
        // You might want to add logic to combine impressions if multiple nodules are significant

        autoImpressionEl.value = impression.trim();
         updateReportPreview(); // Ensure preview updates when auto-impression changes
    }


    // Report preview updates
    function updateReportPreview() {
        // Patient info (more robust selection)
        const nameInput = document.querySelector('#patientInfo input[type="text"], .patient-name'); // Add classes if needed
        const dobInput = document.querySelector('#patientInfo input[type="date"], .patient-dob');
        const mrnInput = document.querySelector('#patientInfo input[type="text"]:nth-of-type(2), .patient-mrn'); // Be specific
        const examDateInput = document.querySelector('#patientInfo input[type="date"]:nth-of-type(2), .exam-date');

        const previewName = document.getElementById('previewName');
        const previewDOB = document.getElementById('previewDOB');
        const previewMRN = document.getElementById('previewMRN');
        const previewExamDate = document.getElementById('previewExamDate');

        if (previewName) previewName.textContent = nameInput?.value || '[Name]';
        if (previewDOB) previewDOB.textContent = dobInput?.value || '[Date of Birth]';
        if (previewMRN) previewMRN.textContent = mrnInput?.value || '[MRN]';
         if (previewExamDate) {
             // Format date if available
             try {
                previewExamDate.textContent = examDateInput?.value ? new Date(examDateInput.value).toLocaleDateString() : '[Exam Date]';
             } catch (e) {
                 previewExamDate.textContent = examDateInput?.value || '[Exam Date]'; // Fallback if date is invalid
             }
         }

        // Findings
        let findingsText = '';

        // Thyroid measurements
        const rightVolume = document.getElementById('rightVolume')?.value;
        const leftVolume = document.getElementById('leftVolume')?.value;
        const isthmusThickness = document.querySelector('#thyroidMeasurements input[type="number"]')?.value; // Assuming it's the only number input there or add specific ID/class

        findingsText += `Right lobe measures ${rightVolume || 'not measured'}. `;
        findingsText += `Left lobe measures ${leftVolume || 'not measured'}. `;
        if (isthmusThickness) {
            findingsText += `Isthmus thickness is ${isthmusThickness} mm. `;
        }

        // Parenchyma
        const echogenicitySelect = document.querySelector('#thyroidMeasurements select:nth-of-type(1)'); // Be specific
        const vascularitySelect = document.querySelector('#thyroidMeasurements select:nth-of-type(2)'); // Be specific
        if (echogenicitySelect && vascularitySelect) {
             const echogenicity = echogenicitySelect.options[echogenicitySelect.selectedIndex].text;
             const vascularity = vascularitySelect.options[vascularitySelect.selectedIndex].text;
             findingsText += `\nParenchyma: Echogenicity is ${echogenicity}. Vascularity is ${vascularity}.`;
        }


        // Nodules
        const nodules = document.querySelectorAll('.nodule-entry');
        if (nodules.length > 0) {
            findingsText += '\n\nNODULE(S):';
            nodules.forEach(nodule => {
                const noduleNumber = nodule.dataset.noduleNumber;
                const locationSelect = nodule.querySelector('.nodule-location');
                const location = locationSelect.options[locationSelect.selectedIndex].text;
                const positionSelect = nodule.querySelector('.nodule-position');
                const position = positionSelect.options[positionSelect.selectedIndex].text;

                const length = nodule.querySelector('.nodule-dimension[data-dim="length"]').value || '?';
                const width = nodule.querySelector('.nodule-dimension[data-dim="width"]').value || '?';
                const height = nodule.querySelector('.nodule-dimension[data-dim="height"]').value || '?';
                const maxDimText = nodule.querySelector('.nodule-max-dim')?.value || 'N/A';

                 // Include TI-RADS score if calculated for this nodule
                 let tiradsInfo = '';
                 if (nodule.dataset.tiradsData) {
                    const tiradsData = JSON.parse(nodule.dataset.tiradsData);
                    // Find the calculated level (needs better storage/retrieval)
                    // For now, just check if it was the selected one
                     if (tiradsSection?.dataset.selectedNodule === nodule.id) {
                        const level = document.getElementById('tiradsLevel')?.textContent;
                        if (level && level !== 'TR?') tiradsInfo = ` (ACR TI-RADS ${level})`;
                    }
                 }


                findingsText += `\n- Nodule ${noduleNumber} (${location}${position ? ', ' + position : ''}): Measures ${length} x ${width} x ${height} cm (Max dimension: ${maxDimText})${tiradsInfo}.`;
                // Add descriptive terms from TI-RADS if desired (e.g., "Solid, hypoechoic, wider-than-tall...")
            });
        } else {
             findingsText += '\n\nNo discrete thyroid nodules identified.';
        }

        // Lymph nodes
        const lymphStatusRadio = document.querySelector('input[name="lymph_status"]:checked');
        if (lymphStatusRadio) {
            const lymphStatus = lymphStatusRadio.value;
            findingsText += '\n\nLYMPH NODES: ';
             if (lymphStatus === 'abnormal') {
                 // Add details about abnormal nodes if captured
                findingsText += 'Abnormal cervical lymph nodes identified (details if entered).';
            } else {
                findingsText += 'No suspicious cervical lymphadenopathy identified.';
            }
        }

        // Additional findings
        const additionalFindings = document.querySelector('textarea[placeholder="Describe any additional findings..."]')?.value;
        if (additionalFindings) {
            findingsText += `\n\nADDITIONAL FINDINGS:\n${additionalFindings}`;
        }

        const previewFindings = document.getElementById('previewFindings');
        if (previewFindings) {
             // Use white-space: pre-wrap for display
            previewFindings.style.whiteSpace = 'pre-wrap';
            previewFindings.textContent = findingsText.trim();
        }


        // Impression
        const customImpression = document.querySelector('textarea[placeholder="Modify the impression as needed..."]')?.value;
        const autoImpression = document.getElementById('autoImpression')?.value;
        const previewImpression = document.getElementById('previewImpression');

         if (previewImpression) {
            previewImpression.style.whiteSpace = 'pre-wrap';
            // Prioritize custom impression, then auto, then placeholder
            let finalImpression = '[Impression will appear here]';
            if (customImpression) {
                finalImpression = customImpression;
            } else if (autoImpression && tiradsSection?.dataset.selectedNodule) { // Only use auto if a nodule is selected for TI-RADS
                finalImpression = autoImpression;
            } else {
                 // Generate a basic impression if no nodules selected/calculated
                 let baseImpression = '';
                 if (rightVolume || leftVolume) baseImpression += `Thyroid gland size as measured. `;
                 if (nodules.length === 0) baseImpression += `No discrete nodules identified. `;
                 // Add parenchyma summary?
                 finalImpression = baseImpression.trim() || finalImpression; // Use generated or default
            }

             previewImpression.textContent = finalImpression;
         }
    }

    // Save button
    const saveBtn = document.getElementById('saveBtn');
    if (saveBtn) {
        saveBtn.addEventListener('click', function() {
            // In a real app, this would format and send data to a server/API
            console.log('Saving report data (simulation)...');
            alert('Report data saved to console/localStorage (simulation).');

            // Basic data structure for localStorage example
            const reportData = {
                patient: {
                    name: document.querySelector('#patientInfo input[type="text"]')?.value,
                    dob: document.querySelector('#patientInfo input[type="date"]')?.value,
                    mrn: document.querySelector('#patientInfo input[type="text"]:nth-of-type(2)')?.value,
                    examDate: document.querySelector('#patientInfo input[type="date"]:nth-of-type(2)')?.value,
                    indication: document.querySelector('#patientInfo select:nth-of-type(2)')?.value, // Example
                    comparison: document.querySelector('#patientInfo select:nth-of-type(1)')?.value // Example
                },
                thyroidMeasurements: {
                    rightLength: document.querySelector('.measurement[data-side="right"][data-dim="length"]')?.value,
                    rightWidth: document.querySelector('.measurement[data-side="right"][data-dim="width"]')?.value,
                    rightHeight: document.querySelector('.measurement[data-side="right"][data-dim="height"]')?.value,
                    rightVolume: document.getElementById('rightVolume')?.value,
                    leftLength: document.querySelector('.measurement[data-side="left"][data-dim="length"]')?.value,
                    leftWidth: document.querySelector('.measurement[data-side="left"][data-dim="width"]')?.value,
                    leftHeight: document.querySelector('.measurement[data-side="left"][data-dim="height"]')?.value,
                    leftVolume: document.getElementById('leftVolume')?.value,
                    isthmusThickness: document.querySelector('#thyroidMeasurements input[type="number"]')?.value, // Example
                    parenchymaEchogenicity: document.querySelector('#thyroidMeasurements select:nth-of-type(1)')?.value, // Example
                    parenchymaVascularity: document.querySelector('#thyroidMeasurements select:nth-of-type(2)')?.value // Example
                },
                nodules: Array.from(document.querySelectorAll('.nodule-entry')).map(nodule => ({
                    id: nodule.id,
                    number: nodule.dataset.noduleNumber,
                    location: nodule.querySelector('.nodule-location')?.value,
                    position: nodule.querySelector('.nodule-position')?.value,
                    length: nodule.querySelector('.nodule-dimension[data-dim="length"]')?.value,
                    width: nodule.querySelector('.nodule-dimension[data-dim="width"]')?.value,
                    height: nodule.querySelector('.nodule-dimension[data-dim="height"]')?.value,
                    maxDim: nodule.querySelector('.nodule-max-dim')?.value,
                    tiradsData: JSON.parse(nodule.dataset.tiradsData || '{}') // Include saved TI-RADS form state
                    // Add marker position? diagram.querySelector(`#marker-${nodule.id}`)?.style.left ... top
                })),
                lymphNodes: {
                    status: document.querySelector('input[name="lymph_status"]:checked')?.value,
                    // Add details if abnormal status selected
                },
                additionalFindings: document.querySelector('textarea[placeholder="Describe any additional findings..."]')?.value,
                impression: document.querySelector('textarea[placeholder="Modify the impression as needed..."]')?.value || document.getElementById('autoImpression')?.value,
                recommendations: document.getElementById('recommendations')?.textContent // Save the final recommendation text
            };

            localStorage.setItem('thyroidReportData', JSON.stringify(reportData));
             console.log("Saved Data:", reportData);
        });
    }

    // Print/PDF button
    const printBtn = document.getElementById('printBtn');
    if (printBtn) {
        printBtn.addEventListener('click', function() {
            // Trigger browser print dialog
            window.print();
            // PDF generation would require a library like jsPDF or html2pdf.js
            // Example with html2pdf (requires including the library):
            /*
            const element = document.body; // Or a specific report container div
            const opt = {
              margin:       0.5,
              filename:     'thyroid_report.pdf',
              image:        { type: 'jpeg', quality: 0.98 },
              html2canvas:  { scale: 2, useCORS: true }, // useCORS might be needed for external images/fonts
              jsPDF:        { unit: 'in', format: 'letter', orientation: 'portrait' }
            };
            html2pdf().set(opt).from(element).save();
            */
        });
    }

    // Add listeners to all inputs/selects/textareas to update preview on change
    document.querySelectorAll('input, select, textarea').forEach(el => {
         el.addEventListener('input', updateReportPreview);
         el.addEventListener('change', updateReportPreview); // For selects and radios/checkboxes
    });

    // Auto-save (optional, basic example) - consider debouncing
    /*
    let saveTimeout;
    document.body.addEventListener('input', () => {
        clearTimeout(saveTimeout);
        saveTimeout = setTimeout(() => {
            if (saveBtn) {
                 console.log("Autosaving...");
                 saveBtn.click();
            }
        }, 30000); // Save 30 seconds after the last input
    }, true); // Use capture phase to catch all inputs
    */

    // Initialize
    calculateVolume('right'); // Initial calculation
    calculateVolume('left');  // Initial calculation
    updateReportPreview(); // Initial preview generation
     // Load saved data on page load (optional)
     /*
     const savedReport = localStorage.getItem('thyroidReportData');
     if (savedReport) {
        console.log("Loading saved report...");
        // Add logic here to parse savedReport (JSON.parse) and populate fields/nodules
        // This is complex and involves recreating nodule elements and their state.
     }
     */

}); // End DOMContentLoaded
