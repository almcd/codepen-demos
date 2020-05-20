// Interactive canvas animation
// ----------------------------
// Vehicle that seeks a draggable target and displays steering and arriving behaviours.
// With thanks to Daniel Shiffman and his brilliant book "The Nature of Code" - http://natureofcode.com
// Uses the Victor.js library for vector math - http://victorjs.org

(function(){

    // ---------------------------------------------
    // Setup the canvas
    var canvas = document.getElementById('canvas');
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
    var ctx = canvas.getContext('2d');

    // Add event listeners
    canvas.addEventListener('mousedown', dragStart, false);
    canvas.addEventListener('mousemove', dragUpdate, false);
    canvas.addEventListener('mouseup', dragEnd, false);

    canvas.addEventListener('touchstart', dragStart, false);
    canvas.addEventListener('touchmove', dragUpdate, false);
    canvas.addEventListener('touchend', dragEnd, false);

    // Initalise variables
    var mouseY, mouseX, dragOk, inBounds;
    var targetX = 100;
    var targetY = 100;

    // ---------------------------------------------
    // Functions for handling mouse and touch input

    /**
     * Draws the target on the canvas
     */
    function drawTarget() {
        ctx.beginPath();
        ctx.arc(targetX, targetY, 20, 0, 2 * Math.PI, false);
        ctx.fillStyle = '#ffcc00';
        ctx.shadowBlur = 4;
        ctx.shadowColor = '#cccccc';
        ctx.fill();
    }

    /**
     * Ascertains if input is within bounds of target
     */
    function inBoundsForDrag() {
        var mouseY = event.clientY || event.targetTouches[0].pageY;
        var mouseX = event.clientX || event.targetTouches[0].pageX;

        var y = mouseY - targetY;
        var x = mouseX - targetX;
        var dist = Math.sqrt(y*y + x*x);

        if (dist < 22) {
            return true;
        } else {
            return false;
        }
    }

    /**
     * Modifies drag status
     */
    function dragStart() {
        inBounds = inBoundsForDrag();
        
        if (inBounds) {
            dragOk = true;
        }
    }

    /**
     * Modifies mouse cursor and updates the target to current input values
     */
    function dragUpdate() {
        inBounds = inBoundsForDrag();

        if (inBounds) {
            document.body.style.cursor = "move";
        } else {
            document.body.style.cursor = "default";
        }

        if (dragOk){
            targetY = event.clientY || event.targetTouches[0].pageY;
            targetX = event.clientX || event.targetTouches[0].pageX;
        }
    }

    /**
     * Flag that dragging has stopped
     */
    function dragEnd() {
        dragOk = false;
    }

    // ---------------------------------------------
    // Vehicle
    Vehicle.prototype = {
        
        /**
         * Core Animation Methods
         */
        update : function () {  
            this.velocityV.add(this.acceleration); // Add acceleration to velocity
            this.maxCap(this.maxspeed); // Limit the max speed
            this.locationV.add(this.velocityV); // Add velocity to location
            this.acceleration.multiplyScalar(0); // Reset acceleration to 0 each cycle
        },

        /**
         * Apples force to acceleration
         * @param  {object} force Vector specifying steering force
         */
        applyForce : function (force) {
            this.acceleration.add(force);
        },

        /**
         * Applies arriving behaviour
         * @param {object} target Vector specifying target
         */
        arrive : function (target) {

            // Create vector with distance between 'target' and 'location'
            var desired = target.clone().subtract(this.locationV);

            // The distance is the magnitude of the vector pointing from location to target
            var distance = desired.length();
            desired.normalize();
            
            // If vehicle is closer than 100 pixels
            if (distance < 150) {
                // Set the magnitude according to how close the vehicle is
                var magnitude = this.mapRange(distance, 0, 150, 0, this.maxspeed);
                desired.multiplyScalar(magnitude);
            } else {
                // Otherwise proceed at maximum speed
                desired.multiplyScalar(this.maxspeed);
            }

            // Store whether the vehicle has arrived or not
            if (distance < 0.50 && this.arrived === false) {
                this.arrived = true;   
            } else {
                this.arrived = false;   
            }

            // Steering is the desired velocity minus the current velocity
            var steer = desired.clone().subtract(this.velocityV);
    
            // Limit steering
            if (steer.lengthSq() > this.maxforce * this.maxforce) {
                steer.normalize().multiplyScalar(this.maxforce);
            }

            this.applyForce(steer); // Call the applyForce method
        },

        /**
         * Draws the vehicle to the canvas
         */
        display : function () {
            // Calculate angle of rotation, so vehicle points in direction of movement, using atan2
            this.angle = Math.atan2(this.velocityV.y, this.velocityV.x) + Math.PI/2;
            
            // Draw vehicle to canvas
            ctx.save();
            ctx.translate(this.locationV.x, this.locationV.y); 
            ctx.rotate(this.angle);
            ctx.shadowBlur = 0;
            ctx.fillStyle = this.primaryColor;
            ctx.beginPath();
            ctx.moveTo(0, -this.radius * 2);
            ctx.lineTo(-this.radius, this.radius * 2);
            ctx.lineTo(this.radius, this.radius * 2);
            ctx.closePath();
            ctx.fill();
            ctx.restore();    
        },

        /**
         * Utility method to limit acceleration
         * @param  {float} Value to restrict acceleration to
         * @return {object}  Modified velocity vector
         */
        maxCap : function (max) {
            if (this.velocityV.lengthSq() > max*max) {
                return this.velocityV.normalize().multiplyScalar(max);
            }
        },

        /**
         * Utility method to re-map a number from one range to another
         * Based on Processing's map() method
         * @param  {integer} value  The value to be modified
         * @param  {integer} istart Lower bound of the value's current range
         * @param  {integer} istop  Upper bound of the value's current range
         * @param  {integer} ostart Lower bound of the value's target range
         * @param  {integer} ostop  Upper bound of the value's target range
         * @return {float}          The modified value
         */
        mapRange : function (value, istart, istop, ostart, ostop) {
            return ostart + (ostop - ostart) * ((value - istart) / (istop - istart));
        }

    }

    /**
     * Vehicle 'constructor' function
     * Specifies initial settings for vehicle
     * @param {integer} xLoc Cartesian coordinate for starting location on x-axis
     * @param {integer} xLoc Cartesian coordinate for starting location on y-axis
     */
    function Vehicle(xLoc, YLoc) {
        this.acceleration = new Victor(0, 0);
        this.velocityV = new Victor(0, 0);
        this.locationV = new Victor(xLoc, YLoc);
        this.radius = 6;
        this.maxspeed = 4.5;
        this.maxforce = 0.1;
        this.primaryColor = '#3fa33f';
        this.arrived = false;
    }

    // Initialise 'instance' of vehicle
    v = new Vehicle(canvas.width/2, canvas.height/2);

    /**
     * Core animation loop
     */
    function animate() {
        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Set and draw target
        this.target = new Victor(targetX, targetY);
        drawTarget();
        
        // Call the appropriate steering behaviours for the vehicle
        v.arrive(this.target);
        v.update();
        v.display();
        
        // Call animation loop recursively
        requestAnimationFrame(animate);
    }

    animate(); // Initial call to animation loop
})();


// ---------------------------------------------
// Adds methods to Victor library to alter vector length
// These methods currently exist as a pull request for the Victor library
// but have not yet been merged into the core by the project maintainers.
// For the time being I've manually added them here.


/**
 * Increase vector length
 *
 * ### Examples:
 *     var vec = new Victor(100, 50);
 *     vec.setLength(120);
 *
 *     vec.toString();
 *     // => x:107.3312629199899, y:53.66563145999495
 *
 * @param {Number} scalar The scalar to set
 * @return {Victor} `this` for chaining capabilities
 * @api public
 */
Victor.prototype.setLength = function (scalar) {
    var length = this.length();

    if (scalar >= 0 && length !== 0) {
        var sinA = this.y / length;
        var sinB = this.x / length;
        this.y = sinA * scalar;
        this.x = sinB * scalar;
    }

    return this;
};

/**
 * Add vector length
 *
 * ### Examples:
 *     var vec = new Victor(100, 50);
 *     vec.addLength(10);
 *
 *     vec.toString();
 *     // => x:108.94427190999916, y:54.47213595499958
 *
 * @param {Number} scalar The scalar to add
 * @return {Victor} `this` for chaining capabilities
 * @api public
 */
Victor.prototype.addLength = function (scalar) {
    return this.setLength(this.length() + scalar);
};