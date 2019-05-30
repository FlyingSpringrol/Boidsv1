//lightweight vector class
function Vector3(x, y, z){
   this.x = x;
   this.y = y;
   this.z = z;
}
//global vector functions
var dot_vecs = function(vec1, vec2){
   return (vec1.x * vec2.x) + (vec1.y * vec2.y) + (vec1.z * vec2.z)
}
var divide_vec_scalar = function(vec1, sca1){
   if (sca1 == 0 || sca1 == undefined){
      return new Vector3(0, 0, 0);
   }
   else{
      return new Vector3(vec1.x / sca1, vec1.y / sca1, vec1.z/ sca1);
   }
}
var magnitude = function(vec){
   return Math.sqrt((vec.x * vec.x) + (vec.y * vec.y) + (vec.z * vec.z));
}
var multiply_vec_scalar = function(vec1, sca1){
   return new Vector3(vec1.x*sca1, vec1.y*sca1, vec1.z*sca1);
}

var add_vecs = function(vec1, vec2){
   return new Vector3(vec1.x + vec2.x, vec1.y + vec2.y, vec1.z + vec2.z);
}

var sub_vecs = function(vec1, vec2){
   return new Vector3(vec1.x - vec2.x, vec1.y - vec2.y, vec1.z - vec2.z);
}
var distance_vecs = function(vec1, vec2){
   return Math.sqrt(Math.pow((vec2.x - vec1.x),2) + Math.pow((vec2.y - vec1.y),2) + Math.pow((vec2.z - vec1.z),2));
}

var draw_boids = function(boids){
   for (var i = 0; i < boids.length; i++){
      if (boids[i]){
         boids[i].draw();
      }
   }
}
var update_boid_positions = function(boids){
   for (var i = 0; i < boids.length; i++){
      if (boids[i]){
         boids[i].update_pos(boids); //update pos based on other boids positions
      }
   }
}

function Boid(context, init_pos, init_velocity, max, vLim, size){ //context, vector object, vector object
   //initialization states
   this.pos = init_pos;
   this.context = context;
   this.velocity = init_velocity;
   this.max = max; //max x and y?
   this.vLim = vLim;
   this.size = size;
   //actual display variables, dependent on update age
   this.life_cycle_count = 0;
   this.curr_speed = 0; //make dependent on age
   this.curr_size = new Vector3(1.0,1.0,0); //also dependent on age
   this.marked_for_death = false;
   this.matable = false;
}
Boid.prototype.check_outside = function(){
   var returnSpeed = 10;
   if (this.pos.x < 0){
      this.velocity.x = returnSpeed;
   }
   else if (this.pos.x > this.max.x){
      this.velocity.x = -returnSpeed;
   }
   else if (this.pos.y < 0){
      this.velocity.y = returnSpeed;
   }
   else if (this.pos.y > this.max.y){
      this.velocity.y = -returnSpeed;
   }
   else if (this.pos.z < 0){
      this.velocity.z = returnSpeed;
   }
   else if (this.pos.z > this.max.z){
      this.velocity.z = -returnSpeed;
   }
}
Boid.prototype.check_velocity = function(){
   var m = magnitude(this.velocity); //magnitude
   if (m > this.curr_speed){
      this.velocity = multiply_vec_scalar(divide_vec_scalar(this.velocity, m), this.vLim);
   }
}
Boid.prototype.update_pos = function(boids){
   var v1 = this.seek_centroid(boids);
   var v2 = this.avoid_nearest(boids);
   var v3 = this.match_velocity(boids);
   var v4 = this.avoid_mouse();
   this.velocity = add_vecs(this.velocity, add_vecs(add_vecs(add_vecs(v1, v3), v2), v4));
   this.check_outside();
   this.check_velocity();
   this.pos = add_vecs(this.pos, this.velocity);
}

Boid.prototype.seek_centroid = function(boids){ //return new velocity
   var centroid = new Vector3(0, 0, 0);
   var move_factor = 200; //iterations to center
   for (var i = 0; i < boids.length; i++){
      if (boids[i] == this) continue; //if itself, ignore
      else centroid = add_vecs(centroid, boids[i].pos);
   }
   centroid = divide_vec_scalar(centroid, boids.length-1);
   centroid = divide_vec_scalar(sub_vecs(centroid, this.pos), move_factor);
   return centroid;
}
Boid.prototype.avoid_mouse = function(boids){
   //Code for mating also lives here
   //TODO: add optimization that only makes boid move away from the closest boid
   var min_dist = 100;
   var repulsion = new Vector3(0, 0, 0);
   var mouse_v = new Vector3(mousex, mousey, 0);
   if (distance_vecs(this.pos, mouse_v) < min_dist){
      var diff = sub_vecs(this.pos, mouse_v); //move away the exact distance
      //random chance of mating
      repulsion = add_vecs(diff, repulsion);
   }
   return divide_vec_scalar(repulsion, 10); //why this magic number?
}
Boid.prototype.avoid_nearest = function(boids){
   //Code for mating also lives here
   //TODO: add optimization that only makes boid move away from the closest boid
   var min_dist = 50;
   var repulsion = new Vector3(0, 0, 0);
   for (var i = 0; i < boids.length; i++){
      if (boids[i] == this) continue; //if itself, ignore
      else if (distance_vecs(this.pos, boids[i].pos) < min_dist){
         var boid = boids[i];
         var diff = sub_vecs(this.pos, boids[i].pos); //move away the exact distance
         //random chance of mating
         repulsion = add_vecs(diff, repulsion);
      }
   }
   return divide_vec_scalar(repulsion, 1000);
}
Boid.prototype.match_velocity = function(boids){
   var vp = new Vector3(0, 0, 0);
   var move_factor = 8;
   for (var i = 0; i < boids.length; i++){
      if (boids[i] == this) continue; //if itself, ignore
      else vp = add_vecs(vp, boids[i].velocity);
   }
   vp = divide_vec_scalar(vp, boids.length - 1); //average centroid
   vp = divide_vec_scalar(vp, move_factor);
   return vp;
}
Boid.prototype.drawNearest = function(){
   //TODO, make into a webGL function
   var x = this.pos.x;
   var y = this.pos.y;
   var xOffset = this.curr_size.x/2;
   var yOffset = this.curr_size.y/2;
   var min_dist = 50;
   for (var i = 0; i < boids.length; i++){
      if (boids[i] == this) continue; //if itself, ignore
      else if (distance_vecs(this.pos, boids[i].pos) < min_dist){
         //this.context.strokeStyle = 'hsl(' + 360 * Math.random() + ', 50%, 50%)';
         this.context.globalAlpha = .05;
         this.context.beginPath();
         this.context.strokeWidth = 4;
         this.context.moveTo(x - xOffset, y - yOffset);
         this.context.lineTo(boids[i].pos.x, boids[i].pos.y);
         this.context.stroke();
         this.context.closePath();
      }
   }
   //reducing alpha slowly https://stackoverflow.com/questions/16776665/canvas-clearrect-with-alpha
}

Boid.prototype.draw = function(){
   //TODO, make into a webGL function
   this.context.beginPath();
   var xOffset = this.curr_size.x/2;
   var yOffset = this.curr_size.y/2;
   var x = this.pos.x;
   var y = this.pos.y;
   var dir = divide_vec_scalar(this.velocity, magnitude(this.velocity)); //normalized direction
   //this.context.fillStyle = 'hsl(' + 360 * Math.random() + ', 50%, 50%)';
   this.context.globalAlpha = 1;
   this.context.arc(x - xOffset, y -yOffset, this.curr_size.x, 0,2*Math.PI);
   this.context.fill();
   this.context.closePath();

   this.drawNearest();
}
