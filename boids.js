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
var boids_chase_mouse = function(boids, x, y){
   for (var i = 0; i < boids.length; i++){
      if (boids[i]){
         boids[i].seek_mouse(x, y); //update pos based on other boids positions
      }
   }
}
function Boid(context, init_pos, init_velocity, max, vLim){ //context, vector object, vector object
   this.pos = init_pos;
   this.context = context;
   this.velocity = init_velocity;
   this.max = max;
   this.vLim = vLim;
}
Boid.prototype.check_outside = function(){
   var returnSpeed = 10;
   if (this.pos.x < 0){
      this.velocity.x = returnSpeed;
   }
   else if (this.pos.x > this.maxX){
      this.velocity.x = -returnSpeed;
   }
   else if (this.pos.y < 0){
      this.velocity.y = returnSpeed;
   }
   else if (this.pos.y > this.maxY){
      this.velocity.y = -returnSpeed;
   }
}
Boid.prototype.check_velocity = function(){
   var m = magnitude(this.velocity); //magnitude
   if (m > this.vLim){
      this.velocity = multiply_vec_scalar(divide_vec_scalar(this.velocity, m), this.vLim);
   }
}
Boid.prototype.update_pos = function(boids){
   var v1 = this.seek_centroid(boids);
   var v2 = this.avoid_nearest(boids);
   var v3 = this.match_velocity(boids);
   this.velocity = add_vecs(this.velocity, add_vecs(add_vecs(v1, v3), v2));
   this.check_outside();
   this.check_velocity();
   this.pos = add_vecs(this.pos, this.velocity);
}
Boid.prototype.seek_mouse = function(x, y){
   //currently unused
   var move_factor = 100;
   this.velocity.x = (this.velocity.x + (x - this.pos.x));
   this.velocity.y = (this.velocity.y + (y - this.pos.y));
}
Boid.prototype.seek_centroid = function(boids){ //return new velocity
   var centroid = new Vector3(0, 0, 0);
   var move_factor = 1000;
   for (var i = 0; i < boids.length; i++){
      if (boids[i] == this) continue; //if itself, ignore
      else centroid = add_vecs(centroid, boids[i].pos);
   }
   //avoid dividing by zero

   centroid = divide_vec_scalar(centroid, boids.length-1);
   centroid = divide_vec_scalar(sub_vecs(centroid, this.pos), move_factor);
   return centroid;
}
Boid.prototype.avoid_nearest = function(boids){
   var min_dist = 20;
   var repulsion = new Vector3(0, 0, 0);
   for (var i = 0; i < boids.length; i++){
      if (boids[i] == this) continue; //if itself, ignore
      else if (distance_vecs(this.pos, boids[i].pos) < min_dist){
         var diff = sub_vecs(this.pos, boids[i].pos); //move away the exact distance
         repulsion = add_vecs(repulsion, diff);
      }
   }
   return repulsion;
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
Boid.prototype.draw = function(){
   //TODO, make into a webGL function
   this.context.beginPath();
   this.context.fillRect(this.pos.x, this.pos.y, 10, 10);
   this.context.closePath();

}
