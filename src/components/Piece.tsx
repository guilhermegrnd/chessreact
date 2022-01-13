import React from 'react';
import blackBishop from '../assets/img/bB.svg';
import blackKing from '../assets/img/bK.svg';
import blackKnight from '../assets/img/bN.svg';
import blackPawn from '../assets/img/bP.svg';
import blackQueen from '../assets/img/bQ.svg';
import blackRook from '../assets/img/bR.svg';
import whiteBishop from '../assets/img/wB.svg';
import whiteKing from '../assets/img/wK.svg';
import whiteKnight from '../assets/img/wN.svg';
import whitePawn from '../assets/img/wP.svg';
import whiteQueen from '../assets/img/wQ.svg';
import whiteRook from '../assets/img/wR.svg';

function Piece({ piece }:{piece:any}) {
  
  let image = blackBishop;
  if(piece.color === 0) {
    switch(piece.class) {
      case 'bishop':
        image = blackBishop;
        break;
      case 'king':
        image = blackKing;
        break;
      case 'knight':
        image = blackKnight;
        break;
      case 'pawn':
        image = blackPawn;
        break;
      case 'queen':
        image = blackQueen;
        break;
      case 'rook':
        image = blackRook;
        break;
    }
  } else {
    switch(piece.class) {
      case 'bishop':
        image = whiteBishop;
        break;
      case 'king':
        image = whiteKing;
        break;
      case 'knight':
        image = whiteKnight;
        break;
      case 'pawn':
        image = whitePawn;
        break;
      case 'queen':
        image = whiteQueen;
        break;
      case 'rook':
        image = whiteRook;
        break;
    }
  }

  return (
    <img src={image} alt={piece.class} style={piece.style} />
  )
}

export default Piece;