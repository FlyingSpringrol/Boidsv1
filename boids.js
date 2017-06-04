
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
var update_boid_positions = function(boids, agents){
   for (var i = 0; i < boids.length; i++){
      if (boids[i]){
         boids[i].update_pos(boids, agents); //update pos based on other boids positions
      }
   }
}
var detect_eating = function(boids, agents){
   //detect if boids are eating agents or vice versa
   for (var i = 0; i < agents.length; i++){
      //going to be real slow
      var agent = agents[i];
      var agentOffsetX = agent.size.x/2;
      var agentOffsetY = agent.size.y/2;
      var agentXMin = agent.pos.x - agentOffsetX;
      var agentYMin = agent.pos.y - agentOffsetY;
      var agentXMax = agent.pos.x + agentOffsetX;
      var agentYMax = agent.pos.y + agentOffsetY;
      for (var j = 0; j < boids.length; j++){
         var boid = boids[j];
         var boidOffsetX = boid.size.x/2;
         var boidOffsetY = boid.size.y/2;
         var boidXMin = boid.pos.x - boidOffsetX;
         var boidYMin = boid.pos.y - boidOffsetY;
         var boidXMax = boid.pos.x + boidOffsetX;
         var boidYMax = boid.pos.y + boidOffsetY;
         if (boidXMin > agentXMin && boidXMax < agentXMax
         && boidYMin > agentYMin && boidYMax < agentYMax){
            boids.splice(j, 1); //the boid has been eaten
         } //full consume collisions
         /* Touch collisions
         if (boidXMin > agentXMin || boidXMax < agentXMax
         || boidYMin > agentYMin || boidYMax < agentYMax){
            boids.splice(j, 1); //the boid has been eaten
         }*/
      }
   }
}
var detect_death = function(boids, upper_population_limit){
   //kill off boids if too old, or kill off if over the population limit
   if (boids.length > upper_population_limit){
      var env_kills = boids.length - upper_population_limit;
      for (var i = 0; i < env_kills; i++){
         var ind = parseInt(Math.random() * boids.length);
         boids.splice(ind, 1);
      }
   }
   for (var i = 0; i < boids.length; i++){
      var boid = boids[i];
      if (boid.marked_for_death){
         boids.splice(i, 1);
      }
   }
}
var draw_agents = function(agents){
   for (var i = 0; i< agents.length; i++){
      if (agents[i]){
         agents[i].draw();
      }
   }
}
function Agent(context, init_pos, size){ //boids avoid these
   this.pos = init_pos; //vector
   this.context = context;
   this.size = size;
}
Agent.prototype.draw = function(){
   //TODO, make into a webGL function
   var xOffset = this.size.x/2;
   var yOffset = this.size.y/2;
   this.context.fillStyle =  "red";
   this.context.fillRect(this.pos.x-xOffset, this.pos.y-xOffset, this.size.x, this.size.y);
   this.context.closePath();

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
   this.curr_size = new Vector3(0,0,0); //also dependent on age
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
Boid.prototype.mate = function(boid2, boids){
   //mate together the two boids
   var speed_mutation_rate = .9;
   var size_mutation_rate = .9;
   var grow_rate = 4;
   var newSpeed = (this.vLim + boid2.vLim)/ 2; //average parents speeds
   if (Math.random() < speed_mutation_rate){
      newSpeed += Math.random()/2;
   }
   var newSize = divide_vec_scalar(add_vecs(this.size, boid2.size), 2);
   if (Math.random() < size_mutation_rate){
      newSize = new Vector3(newSize.x + Math.random()*grow_rate, newSize.y + Math.random()*grow_rate, newSize.z + Math.random()*grow_rate);
   }
   //need evolutionary bias towards being the bigger, fatter boids: more mating collision
   var childBoid = new Boid(this.context, this.pos, this.velocity, this.max, newSpeed, newSize);
   boids.push(childBoid);
}

Boid.prototype.avoid_agents = function(agents){
   var min_dist = 200;
   var repulsionFactor = 40;
   var repulsion = new Vector3(0, 0, 0);
   for (var i = 0; i < agents.length; i++){
      if (boids[i] == this) continue; //if itself, ignore
      else if (distance_vecs(this.pos, agents[i].pos) < min_dist){
         var diff = sub_vecs(this.pos, agents[i].pos); //move away the exact distance
         repulsion = add_vecs(repulsion, diff);
      }
   }
   return multiply_vec_scalar(repulsion, repulsionFactor);
}
Boid.prototype.check_velocity = function(){
   var m = magnitude(this.velocity); //magnitude
   if (m > this.curr_speed){
      this.velocity = multiply_vec_scalar(divide_vec_scalar(this.velocity, m), this.vLim);
   }
}
Boid.prototype.update_pos = function(boids, agents){
   var v1 = this.seek_centroid(boids);
   var v2 = this.avoid_nearest(boids);
   var v3 = this.match_velocity(boids);
   var v4 = this.avoid_agents(agents); //agent position is global
   this.velocity = add_vecs(this.velocity, add_vecs(add_vecs(add_vecs(v1, v3), v2),v4));
   this.check_outside();
   this.check_velocity();
   this.pos = add_vecs(this.pos, this.velocity);
   this.calculate_lifecycle();
}
Boid.prototype.calculate_lifecycle = function(){
   //calculates all the life cycle dependent variables
   var u_range = 1000;
   var old_age = 10000;
   this.life_cycle_count += 1;
   if (this.life_cycle_count < u_range){ //mimic full adulthood
      this.curr_size = multiply_vec_scalar(this.size, this.life_cycle_count/u_range);
      this.curr_speed = this.vLim * (this.life_cycle_count/u_range);
   }
   else if (this.life_cycle_count > old_age){
      this.marked_for_death = true;
   }
   else {
      this.matable = true;
   }
}

Boid.prototype.seek_centroid = function(boids){ //return new velocity
   var centroid = new Vector3(0, 0, 0);
   var move_factor = 1000;
   for (var i = 0; i < boids.length; i++){
      if (boids[i] == this) continue; //if itself, ignore
      else centroid = add_vecs(centroid, boids[i].pos);
   }
   centroid = divide_vec_scalar(centroid, boids.length-1);
   centroid = divide_vec_scalar(sub_vecs(centroid, this.pos), move_factor);
   return centroid;
}
Boid.prototype.avoid_nearest = function(boids){

   //Code for mating also lives here
   //TODO: add optimization that only makes boid move away from the closest boid
   var min_dist = 20;
   var repulsion = new Vector3(0, 0, 0);
   var mating_factor = .1;
   for (var i = 0; i < boids.length; i++){
      if (boids[i] == this) continue; //if itself, ignore
      else if (distance_vecs(this.pos, boids[i].pos) < min_dist){
         var boid = boids[i];
         var diff = sub_vecs(this.pos, boids[i].pos); //move away the exact distance
         //random chance of mating
         var mating_chance = mating_factor * boid.size.x; //bias fat boids
         if (this.matable && boid.matable && Math.random() < mating_chance){
            this.mate(boid, boids);
            continue;  //also don't do the repulsion calculation
         }
         repulsion = add_vecs(diff, repulsion);
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
   var xOffset = this.curr_size.x/2;
   var yOffset = this.curr_size.y/2;
   var dir = divide_vec_scalar(this.velocity, magnitude(this.velocity)); //normalized direction
   this.context.fillStyle = "black";
   this.context.fillRect(this.pos.x - xOffset, this.pos.y-yOffset, this.curr_size.x, this.curr_size.y);
   this.context.fillStyle = "blue";
   this.context.fillRect(this.pos.x- xOffset + (dir.x*this.curr_size.x), this.pos.y - yOffset + (dir.y*this.curr_size), 5, 5); //render head
   this.context.closePath();

}
