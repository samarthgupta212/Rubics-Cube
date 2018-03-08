import Responder from '../../lib/expressResponder';
import { Cube } from '../models'
import {ServiceUnavailableError, ParameterInvalidError, BadRequestError, ForbiddenError} from '../errors';
import _  from 'lodash';

const validate = (body) => {

  const regexName = /[a-z]/gi;
  const regexEmail = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

  const { name, email, direction, attribute, number, rotateDirection } = body;

  if(!_.isUndefined(name) && (!_.isString(name) || !(name.trim()) || name.match(regexName).length != name.length))
      return Responder.operationFailed(res, new BadRequestError('Name must be valid string'));

  if(!_.isUndefined(direction) && direction !== 0 && direction !== 1)
      return { message: 'Direction can only be 0 or 1, 0 for left and 1 for right'};

  if(!_.isUndefined(email) && email.match(regexEmail) === null) {
    return { message: 'Email should be valid'};
  }

  if(!_.isUndefined(attribute) && (!_.isString(attribute) || (attribute !== 'col' && attribute !== 'row'))) 
    return { message: 'attribute must be a string having value either row or col'};
 
  if(!_.isUndefined(number) && (!_.isNumber(number) ||  number < 1 || number > 3))
    return { message: 'Number can have value between 1 and 3 '};

  if(!_.isUndefined(rotateDirection) && (rotateDirection !== 'left' && rotateDirection !== 'right' && 
      rotateDirection !== 'up' && rotateDirection !== 'down'))
    return { message: 'rotateDirection can have value up, down, left, right'};

} 

const rightRotate =  (array) =>  {     //right rotate
  const Length = array.length;
  return array.slice(Length - 1).concat(array.slice(0, Length - 1));
};

const leftRotate = (array)  => {         
  const Length = array.length;
  return array.slice(1, Length).concat(array.slice(0, 1))
}

const flipAntiClockwise = (array) => {

  let block1 = array[0];
  array[0] = array[2];
  array[2] = array[8];
  array[8] = array[6];
  array[6] = block1;

  block1 = array[1];
  array[1] = array[5];
  array[5] = array[7];
  array[7] = array[3];
  array[3] = block1;
}

const flipClockwise = (array) => {

  let block1 = array[0];
  array[0] = array[6];
  array[6] = array[8];
  array[8] = array[2];
  array[2] = block1;

  block1 = array[1];
  array[1] = array[3];
  array[3] = array[7];
  array[7] = array[5];
  array[5] = block1;
}

Array.prototype.swapTwo = function(block1, block2) {
  let temp = this[block1];
  this[block1] = this[block2];
  this[block2] = temp;
}

const mirror = (array) => {
  array.swapTwo(0, 8);
  array.swapTwo(1, 7);
  array.swapTwo(2, 6);
  array.swapTwo(3, 5);

}

const swap = (face1, face2, face3, face4, direction, block) => {

  let block1 = face1[block];
  if(direction) {
      face1[block] = face4[block];
      face4[block] = face3[block];
      face3[block] = face2[block];
      face2[block] = block1;
    }
    else {
      face1[block] = face2[block];
      face2[block] = face3[block];
      face3[block] = face4[block];
      face4[block] = block1;
    }
}

const swapOpposite = (face1, face2, face3, face4, direction, block) => {

  let block1 = face1[block];
  if(!direction) {
      face1[block] = face4[block];
      face4[block] = face3[8 - block];
      face3[8 - block] = face2[block];
      face2[block] = block1;
    }
    else {
      face1[block] = face2[block];
      face2[block] = face3[8 - block];
      face3[8 - block] = face4[block];
      face4[block] = block1;
    }
}

const changeConfiguration = (attribute, number, player, direction) => {

  const { face, horizontal, vertical } = player;
  let body = {};

  if(attribute == 'row') {

    let face1 = face[horizontal[0]], face2 = face[horizontal[1]], face3 = face[horizontal[2]], face4 = face[horizontal[3]];

    for(let block = 3*(number - 1); block < 3*number; block++) {
      swapOpposite(face1, face2, face3, face4, direction, block);
    }

    if(number === 1) {
      if(!direction) flipClockwise(face[vertical[1]]);
      else flipAntiClockwise(face[vertical[1]]);
      body[vertical[1]] = face[vertical[1]];
    }
    else if(number === 3) {
      if(!direction) flipAntiClockwise(face[vertical[3]]);
      else flipClockwise(face[vertical[3]]);
      body[vertical[3]] = face[vertical[3]];
    }

    body[horizontal[0]] = face1;
    body[horizontal[1]] = face2;
    body[horizontal[2]] = face3;
    body[horizontal[3]] = face4;
    body[vertical[0]] = face[vertical[0]];
    body[vertical[2]] = face[vertical[2]];
    
  }

  else {

    let face1 = face[vertical[0]], face2 = face[vertical[1]], face3 = face[vertical[2]], face4 = face[vertical[3]];
    let iteration = 0;

    for(let block = (number - 1); iteration < 3; block += 3) {
      iteration++;
      swap(face1, face2, face3, face4, direction, block);
    }

    if(number === 1) {
      if(!direction) flipClockwise(face[horizontal[3]]);
      else flipAntiClockwise(face[horizontal[3]]);
      body[horizontal[3]] = face[horizontal[3]];
    }
    else if(number === 3) {
      if(!direction) flipAntiClockwise(face[horizontal[1]]);
      else flipClockwise(face[horizontal[1]]);
      body[horizontal[1]] = face[horizontal[1]];
    }

    body[vertical[0]] = face1;
    body[vertical[1]] = face2;
    body[vertical[2]] = face3;
    body[vertical[3]] = face4;
    body[horizontal[0]] = face[horizontal[0]];
    body[horizontal[2]] = face[horizontal[2]];

  }

  const newFace = {"face": body};
  
  return newFace;
}

const changeFace = (horizontal, vertical, type) => {
  let body = {};

  if(!type) {
    vertical[0] = horizontal[0], vertical[2] = horizontal[2];
  }
  else {
    horizontal[0] = vertical[0], horizontal[2] = vertical[2];
  }

  body['vertical'] = vertical;
  body['horizontal'] = horizontal;

  return body;
}

const getRandomArbitrary = (min, max) => {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

const scramble = (cube, iteration) => {

  const attribute = ['row', 'col'];

  if(iteration == 0)
  {
    Cube.update({_id: cube._id}, cube) 
      .catch();
    return;
  }
  
  let randomAttributeNumber = getRandomArbitrary(0, 1);
  let randomNumber = getRandomArbitrary(1, 3);
  let randomDirection = getRandomArbitrary(0, 1);
  let body = changeConfiguration(attribute[randomAttributeNumber], randomNumber, cube, randomDirection);
  Cube.update({_id: cube._id}, body, {new: true})
    .then(() => {
      scramble(cube, iteration - 1);
    })
    .catch(() => Responder.operationFailed(res, new BadRequestError('Unable to request')));  
}

export default class CubeController {

  static startNewGame(req, res) {

    const body = req.body;
    const requiredKeys = ['name', 'email'];
    
    if(! _.every(requiredKeys, _.partial(_.has, body)))
      return Responder.operationFailed(res, new BadRequestError('Name and email is required'));

    const planValidate = validate(body);

    if(!_.isUndefined(planValidate) && planValidate.hasOwnProperty('message'))
      return Responder.operationFailed(res, new BadRequestError(planValidate.message));

    Cube.create(body)
      .then(cube => {
        Responder.success(res, cube);
        scramble(cube, 10);
      })      
      .catch(err => Responder.operationFailed(res, new ServiceUnavailableError(err)));
  }

  static configuration(req, res) {

    Cube.findById(req.params.playerId)
      .then(player => {
        if(player === [])
          return Responder.operationFailed(res, new ParameterInvalidError('Id does not exist in database'));
        Responder.success(res, player);
      })
      .catch(err => Responder.operationFailed(res, new ParameterInvalidError('Invalid Id')));
  }

  static getAllPlayers(req, res) {

    Cube.find()
      .then(players => Responder.success(res, players))
      .catch(err => Responder.operationFailed(res, new BadRequestError('Bad Request')));
  }

  static changeCubeConfiguration(req, res) {

    const body = req.body;
    const { attribute, number, direction } = body;

    const requiredKeys = ['attribute', 'number', 'direction'];
    
    if(! _.every(requiredKeys, _.partial(_.has, body)))
      return Responder.operationFailed(res, new BadRequestError('attribute, number and direction is required'));

    const planValidate = validate(body);

    if(!_.isUndefined(planValidate) && planValidate.hasOwnProperty('message'))
      return Responder.operationFailed(res, new BadRequestError(planValidate.message)); 

    Cube.findById(req.params.playerId)
      .then(player => {
        if(player === [])
          return Responder.operationFailed(res, new ParameterInvalidError('Id does not exist in database'));

        const newFace = changeConfiguration(attribute, number, player, direction);

        Cube.update({_id: player._id}, newFace)
          .then(cube => Responder.success(res, {message: 'Cube updated'}))
          .catch(err => Responder.operationFailed(res, new ServiceUnavailableError('Unable to Update')))
        })
      .catch(err => Responder.operationFailed(res, new ParameterInvalidError('Invalid Id')));
  }

  static changeActiveFace(req, res) {

    const body = req.body;
    const { rotateDirection } = body;

    if(!body.hasOwnProperty('rotateDirection'))
      return Responder.operationFailed(res, new BadRequestError('rotateDirection is required'));

    const planValidate = validate(body);

    if(!_.isUndefined(planValidate) && planValidate.hasOwnProperty('message'))
      return Responder.operationFailed(res, new BadRequestError(planValidate.message)); 

    Cube.findById(req.params.playerId)
      .then(player => {
        if(player === [])
          return Responder.operationFailed(res, new ParameterInvalidError('Id does not exist in database'));

        let { vertical, horizontal, face } = player;
        let type = 0;
        let newFace = {};

        if(rotateDirection == 'left') {
          mirror(face[horizontal[3]]);
          mirror(face[horizontal[2]]);
          horizontal = leftRotate(horizontal);
          flipClockwise(face[vertical[1]]);
          flipClockwise(face[vertical[3]]);
          
        }
        else if(rotateDirection == 'right') {
        	mirror(face[horizontal[1]]);
          mirror(face[horizontal[2]]);
          horizontal = rightRotate(horizontal);
          flipAntiClockwise(face[vertical[1]]);
          flipAntiClockwise(face[vertical[3]]);      

        }
        else if(rotateDirection == 'down') {
          type = 1;
          vertical = leftRotate(vertical);
          flipClockwise(face[horizontal[3]]);
          flipClockwise(face[horizontal[1]]);
        }
        else {
          type = 1;
          vertical = rightRotate(vertical);
          flipAntiClockwise(face[horizontal[1]]);
          flipAntiClockwise(face[horizontal[3]]);
        }

        newFace[vertical[1]] = face[vertical[1]];
        newFace[vertical[3]] = face[vertical[3]];
        newFace[vertical[0]] = face[vertical[0]];
        newFace[vertical[2]] = face[vertical[2]];
        newFace[horizontal[1]] = face[horizontal[1]];
        newFace[horizontal[3]] = face[horizontal[3]];
        newFace[horizontal[2]] = face[horizontal[2]];
        newFace[horizontal[0]] = face[horizontal[0]];


        let newCubeFace = {"face": newFace};

        let Face = changeFace(horizontal, vertical, type);

        newCubeFace['vertical'] = Face['vertical'];
        newCubeFace['horizontal'] = Face['horizontal'];
        
        console.log(newCubeFace);        
        Cube.update({_id: player._id}, newCubeFace)
          .then(() => Responder.success(res, newCubeFace))
          .catch(err => Responder.operationFailed(res, new ServiceUnavailableError('Unable to update')))
        })
        .catch(err => Responder.operationFailed(res, new ParameterInvalidError('Invalid Id')));
  }
}
