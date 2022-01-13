export function emptySquare(selectedSquare:any) {
  // if(selectedSquare === undefined) return true;
  return selectedSquare.constructor === Object && Object.keys(selectedSquare).length === 0;
};

export function adversaryColor(color:Number) {
  return (color === 1) ? 0 : 1;
};

export function inCheck(color:Number, board:any, match:any) {
  const king = getKing(color, board);
  if(emptySquare(king)) {
    return true;
  }
  let aux = getPiecesByColor(adversaryColor(color), board);
  for(let i = 0; i < aux.length; i++) {
    let matrix = checkPossibleMoves({ row: aux[i].row, column: aux[i].column }, board, match);
    if(matrix[king.row][king.column]) {
      return true;
    }
  }
  return false;
};

export function inCheckMate(color:Number, board:any, match:any) {
  if(!inCheck(color, board, match)) {
    return false;
  }
  let aux = getPiecesByColor(color, board);
  for(let k = 0; k < aux.length; k++) {
    let matrix = checkPossibleMoves({ row: aux[k].row, column: aux[k].column }, board, match);
    for(let i = 0; i < 8; i++) {
      for(let j = 0; j < 8; j++) {
        if(matrix[i][j]) {
          let origin = { row: aux[k].row, column: aux[k].column };
          let destination = { row: i, column: j };
          let pieceTaken = testMove(origin, destination, board);
          let checkTest = inCheck(color, board, match);
          undoMove(origin, destination, pieceTaken, board,match);
          if(!checkTest) {
            return false;
          }
        }
      }
    }
  }
  return true;
}

export function getPiecesByColor(color:Number, board:any) {
  let aux = [];
  for (let i = 0; i < 8; i++) {
    for (let j = 0; j < 8; j++) {
      if (!emptySquare(board[i][j])) {
        const pieceFound:any = { ...board[i][j], row: i, column: j };
        if(pieceFound.color === color) aux.push(pieceFound);
      }
    }
  }
  return aux;
}

export function getKing(color:Number, board:any) {
  let aux = getPiecesByColor(color, board);
  for (let i = 0; i < aux.length; i++) {
    if (aux[i].class === "king") {
      return aux[i];
    }
  }
  return {};
}

export function testMove(origin:any,destination:any, board:any) {

  //const originRow = [...board[origin.row]];
  //const destinationRow = [...board[destination.row]];
  
  const originPiece:any = board[origin.row][origin.column];
  let pieceTaken = board[destination.row][destination.column];
  board[origin.row][origin.column] = {};
  board[destination.row][destination.column] = { ...originPiece, row: destination.row, column: destination.column };

  //SHORT CASTLE
  if (originPiece.class === "king" && destination.column === originPiece.column + 2) {
    const originRook = board[origin.row][originPiece.column + 3];
    board[origin.row][originPiece.column + 3] = {};
    board[origin.row][originPiece.column + 1] = originRook;
  }
  //LONG CASTLE
  if (originPiece.class === "king" && destination.column === originPiece.column - 2) {
    const originRook = board[origin.row][originPiece.column - 4];
    board[origin.row][originPiece.column - 4] = {};
    board[origin.row][originPiece.column - 1] = originRook;
  }

  //EN PASSANT
  if (originPiece.class === "pawn") {
    if (origin.column !== destination.column && emptySquare(destination)) {
      if (originPiece.color === 1) {
        const destinationRow1 = [...board[destination.row + 1]];
        pieceTaken = destinationRow1[destination.column];
        destinationRow1[destination.column] = originPiece;
      } else {
        const destinationRowm1 = [...board[destination.row - 1]];
        pieceTaken = destinationRowm1[destination.column];
        destinationRowm1[destination.column] = originPiece;
      }
    }
  }

  return { ...pieceTaken, row: destination.row, column: destination.column };
}

export function undoMove(origin:any,destination:any, pieceTaken:any, board:any, match:any) {
  const { row, column } = destination;

  //const originRow = [...board[origin.row]];
  //const destinationRow = [...board[destination.row]];

  const pieceRecovered:any = { ...board[destination.row][column], row, column };
  board[destination.row][destination.column] = {};
  if (pieceTaken.hasOwnProperty('class')) {
    board[destination.row][destination.column] = { ...pieceTaken, row: destination.row, column: destination.column };
  }
  if (pieceRecovered.hasOwnProperty('class')) {
    board[origin.row][origin.column] = { ...pieceRecovered, row: origin.row, column: origin.column };
  }
  //SHORT CASTLE
  if (pieceRecovered.class === "king" && destination.column === origin.column + 2) {
    const originRook = board[origin.row][origin.column + 1];
    board[origin.row][origin.column + 1] = {};
    board[origin.row][origin.column + 3] = originRook;
  }
  //LONG CASTLE
  if (pieceRecovered.class === "king" && destination.column === origin.column - 2) {
    const originRook = board[origin.row][origin.column - 1];
    board[origin.row][origin.column - 1] = {};
    board[origin.row][origin.column - 4] = originRook;
  }

  //EN PASSANT
  if (pieceRecovered.class === "pawn") {
  	if (origin.column !== destination.column && match.enPassant) {
  		let pawn = board[destination.row][destination.column];
  		if (pieceRecovered.color === 1) {
        const destinationRow3 = [...board[3]];
        destinationRow3[destination.column] = pawn;
  		} else {
        const destinationRow4 = [...board[4]];
        destinationRow4[destination.column] = pawn;
  		}
  	}
  }

  return board;
}

export function executePlay(board:any, possibleMoves:any, match:any, pieceSelected:any, square:any) {
  
  const { row, column } = square;

  const originRow = [...board[pieceSelected.row]];
  const destinationRow = [...board[row]];
  
  let { onMove, currentPlayer, check, checkMate, gameOver, enPassant } = match;
  let move = false;
  let started = true;
  enPassant = false;

  let modalShow = false;
  let modalMessage = ``;

  if(!possibleMoves[row][column]) {
    onMove = false;
  } else {
    //SHORT CASTLE
    if (pieceSelected.class === "king" && column === pieceSelected.column + 2 && pieceSelected.moves === 0) {
      let originRook = destinationRow[pieceSelected.column + 3];
      destinationRow[pieceSelected.column + 3] = {};
      destinationRow[pieceSelected.column + 1] = originRook;
      destinationRow[pieceSelected.column] = {};
    }
    //LONG CASTLE
    if (pieceSelected.class === "king" && column === pieceSelected.column - 2 && pieceSelected.moves === 0) {
      let originRook = destinationRow[pieceSelected.column - 4];
      destinationRow[pieceSelected.column - 4] = {};
      destinationRow[pieceSelected.column - 1] = originRook;
      destinationRow[pieceSelected.column] = {};
    }

    //EN PASSANT
    if (pieceSelected.class === "pawn") {
      if (pieceSelected.column !== column && emptySquare(destinationRow[column])) {
        originRow[column] = {};
      }
    }
    
    let pieceTaken = testMove(pieceSelected, square,board);
    let checkTest = inCheck(match.currentPlayer,board,match);
    if(checkTest) {
      undoMove(pieceSelected, square, pieceTaken,board,match);
      modalShow = true;
      modalMessage = `Você não pode se colocar em Xeque!`;
      onMove = false;
    } else {
      move = true;
    }
  }

  let updatedWhitePiecesTaken:any = [];
  let updatedBlackPiecesTaken:any = [];
  
  if(move) {
    if(!emptySquare(destinationRow[column])) {
      let pieceTaken:any = destinationRow[column];
      if(pieceTaken.color === 1) {
        updatedWhitePiecesTaken.push(pieceTaken);
      } else {
        updatedBlackPiecesTaken.push(pieceTaken);
      }
    }
    
    originRow[pieceSelected.column] = {};
    if(row === pieceSelected.row) {
      destinationRow[pieceSelected.column] = {};
    }
    
    //EN PASSANT
    if (pieceSelected.class === "pawn") {
      for(let i = 0; i < 8; i++)
        for(let j = 0; j < 8; j++)
          if(board[i][j].class === 'pawn') board[i][j].enPassant = false;

      if (square.row === pieceSelected.row - 2 || square.row === pieceSelected.row + 2) {
        enPassant = true;
        pieceSelected = { ...pieceSelected, enPassant };
      }
    }

    destinationRow[square.column] = { ...pieceSelected, moves: (pieceSelected.moves + 1) };

    //PROMOTION
    if(pieceSelected.class === "pawn") {
      if((pieceSelected.color === 1 && row === 0) || (pieceSelected.color === 0 && row === 7)) {
        destinationRow[column] = { ...pieceSelected, class: 'queen'};
      }
    }

    board[pieceSelected.row] = originRow;
    board[row] = destinationRow;
    
    if(inCheck(adversaryColor(match.currentPlayer),board,match)) {
      if (inCheckMate(adversaryColor(match.currentPlayer),board,match)) {
        check = true;
        started = false;
        gameOver = true;
        checkMate = true;
        //GAME OVER
        modalShow = true;
        modalMessage = `Jogo Acabou!  ${match.currentPlayer === 1 ? 'Brancas' : 'Pretas'} Venceram`;
      } else {
        check = true;
        modalShow = true;
        modalMessage = `Xeque!`;
      }
    } else {
      check = false;
    }

    currentPlayer = adversaryColor(currentPlayer);
    onMove = false;
  }
  
  return {
    updatedMatch: {
      checkMate, onMove, currentPlayer, check, gameOver, started, enPassant
    },
    updatedModal: {
      show: modalShow, message: modalMessage
    },
    updatedBoard: board,
    updatedWhitePiecesTaken,
    updatedBlackPiecesTaken
  }
}

export function checkPossibleMoves(selectedSquare:any, board:any, match:any) {
  const { row, column } = selectedSquare;
  const piece:any = board[row][column];
  let updatedPossibleMoves:any = [
    [ false, false, false, false, false, false, false, false ],
    [ false, false, false, false, false, false, false, false ],
    [ false, false, false, false, false, false, false, false ],
    [ false, false, false, false, false, false, false, false ],
    [ false, false, false, false, false, false, false, false ],
    [ false, false, false, false, false, false, false, false ],
    [ false, false, false, false, false, false, false, false ],
    [ false, false, false, false, false, false, false, false ]
  ];
  
  let i = 1;
  let j = 1;
  switch(piece.class) {
    case 'bishop':
      //SOUTHEAST
      i = 1;
      j = 1;
      while(true) {
        if(board[row + i] !== undefined && board[row + i][column + j] !== undefined) {
          if(emptySquare(board[row + i][column + j])) 
          {
            updatedPossibleMoves[row + i][column + j] = true;
          }
          else
          {
            const pieceFound:any = board[row + i][column + j];
            if(pieceFound.color !== piece.color) updatedPossibleMoves[row + i][column + j] = true;
            break;
          }
        } else {
          break;
        }
        i++;
        j++;
      }
      //SOUTHWEST
      i = 1;
      j = 1;
      while(true) {
        if(board[row + i] !== undefined && board[row + i][column - j] !== undefined) {
          if(emptySquare(board[row + i][column - j])) 
          {
            updatedPossibleMoves[row + i][column - j] = true;
          }
          else
          {
            const pieceFound:any = board[row + i][column - j];
            if(pieceFound.color !== piece.color) updatedPossibleMoves[row + i][column - j] = true;
            break;
          }
        } else {
          break;
        }
        i++;
        j++;
      }
      //NORTHEAST
      i = 1;
      j = 1;
      while(true) {
        if(board[row-i] !== undefined && board[row-i][column + j] !== undefined) {
          if(emptySquare(board[row-i][column + j])) 
          {
            updatedPossibleMoves[row-i][column + j] = true;
          }
          else
          {
            const pieceFound:any = board[row-i][column + j];
            if(pieceFound.color !== piece.color) updatedPossibleMoves[row-i][column + j] = true;
            break;
          }
        } else {
          break;
        }
        i++;
        j++;
      }
      //NORTHWEST
      i = 1;
      j = 1;
      while(true) {
        if(board[row - i] !== undefined && board[row - i][column - j] !== undefined) {
          if(emptySquare(board[row - i][column - j])) 
          {
            updatedPossibleMoves[row - i][column - j] = true;
          }
          else
          {
            const pieceFound:any = board[row - i][column - j];
            if(pieceFound.color !== piece.color) updatedPossibleMoves[row - i][column - j] = true;
            break;
          }
        } else {
          break;
        }
        i++;
        j++;
      }
      break;
    case 'king':
      //NORTH
      if(board[row - 1] !== undefined && board[row - 1][column] !== undefined) {
        if(emptySquare(board[row - 1][column])) {
          updatedPossibleMoves[row - 1][column] = true;
        } else {
          const pieceFound:any = board[row - 1][column];
          if(pieceFound.color !== piece.color) updatedPossibleMoves[row - 1][column] = true;
        }
      }
      //NORTHEAST
      if(board[row - 1] !== undefined && board[row - 1][column + 1] !== undefined) {
        if(emptySquare(board[row - 1][column + 1])) {
          updatedPossibleMoves[row - 1][column + 1] = true;
        } else {
          const pieceFound:any = board[row - 1][column + 1];
          if(pieceFound.color !== piece.color) updatedPossibleMoves[row - 1][column + 1] = true;
        }
      }
      //EAST
      if(board[row] !== undefined && board[row][column + 1] !== undefined) {
        if(emptySquare(board[row][column + 1])) {
          updatedPossibleMoves[row][column + 1] = true;
        } else {
          const pieceFound:any = board[row][column + 1];
          if(pieceFound.color !== piece.color) updatedPossibleMoves[row][column + 1] = true;
        }
      }
      //SOUTHEAST
      if(board[row + 1] !== undefined && board[row + 1][column + 1] !== undefined) {
        if(emptySquare(board[row + 1][column + 1])) {
          updatedPossibleMoves[row + 1][column + 1] = true;
        } else {
          const pieceFound:any = board[row + 1][column + 1];
          if(pieceFound.color !== piece.color) updatedPossibleMoves[row + 1][column + 1] = true;
        }
      }
      //SOUTH
      if(board[row + 1] !== undefined && board[row + 1][column] !== undefined) {
        if(emptySquare(board[row + 1][column])) {
          updatedPossibleMoves[row + 1][column] = true;
        } else {
          const pieceFound:any = board[row + 1][column];
          if(pieceFound.color !== piece.color) updatedPossibleMoves[row + 1][column] = true;
        }
      }
      //SOUTHWEST
      if(board[row + 1] !== undefined && board[row + 1][column - 1] !== undefined) {
        if(emptySquare(board[row + 1][column - 1])) {
          updatedPossibleMoves[row + 1][column - 1] = true;
        } else {
          const pieceFound:any = board[row + 1][column - 1];
          if(pieceFound.color !== piece.color) updatedPossibleMoves[row + 1][column - 1] = true;
        }
      }
      //WEST
      if(board[row] !== undefined && board[row][column - 1] !== undefined) {
        if(emptySquare(board[row][column - 1])) {
          updatedPossibleMoves[row][column - 1] = true;
        } else {
          const pieceFound:any = board[row][column - 1];
          if(pieceFound.color !== piece.color) updatedPossibleMoves[row][column - 1] = true;
        }
      }
      //NORTHWEST
      if(board[row - 1] !== undefined && board[row - 1][column - 1] !== undefined) {
        if(emptySquare(board[row - 1][column - 1])) {
          updatedPossibleMoves[row - 1][column - 1] = true;
        } else {
          const pieceFound:any = board[row - 1][column - 1];
          if(pieceFound.color !== piece.color) updatedPossibleMoves[row - 1][column - 1] = true;
        }
      }

      //CASTLE
      if(piece.moves === 0 && !match.check) {
        //SHORT CASTLE
        const pieceRook1:any = board[row][column + 3];
        if(pieceRook1 !== undefined && pieceRook1.moves === 0 && pieceRook1.class === 'rook') {
          const pos1 = board[row][column + 1];
          const pos2 = board[row][column + 2];
          if(emptySquare(pos1) && emptySquare(pos2)) {
            updatedPossibleMoves[row][column + 2] = true;
          }
        }

        //LONG CASTLE
        const pieceRook2:any = board[row][column - 4];
        if(pieceRook2 !== undefined && pieceRook2.moves === 0 && pieceRook2.class === 'rook') {
          const pos1 = board[row][column - 1];
          const pos2 = board[row][column - 2];
          const pos3 = board[row][column - 3];
          if(emptySquare(pos1) && emptySquare(pos2) && emptySquare(pos3)) {
            updatedPossibleMoves[row][column - 2] = true;
          }
        }
      }
      break;
    case 'knight':
      //NORTHEAST
      if(board[row - 2] !== undefined && board[row - 2][column + 1] !== undefined) {
        if(emptySquare(board[row - 2][column + 1])) 
        {
          updatedPossibleMoves[row - 2][column + 1] = true;
        }
        else
        {
          const pieceFound:any = board[row - 2][column + 1];
          if(pieceFound.color !== piece.color) updatedPossibleMoves[row - 2][column + 1] = true;
        }
      }
      if(board[row - 1] !== undefined && board[row - 1][column + 2] !== undefined) {
        if(emptySquare(board[row - 1][column + 2])) 
        {
          updatedPossibleMoves[row - 1][column + 2] = true;
        }
        else
        {
          const pieceFound:any = board[row - 1][column + 2];
          if(pieceFound.color !== piece.color) updatedPossibleMoves[row - 1][column + 2] = true;
          
        }
      }				
      //NORTHWEST
      if(board[row - 2] !== undefined && board[row - 2][column - 1] !== undefined) {
        if(emptySquare(board[row - 2][column - 1])) 
        {
          updatedPossibleMoves[row - 2][column - 1] = true;
        }
        else
        {
          const pieceFound:any = board[row - 2][column - 1];
          if(pieceFound.color !== piece.color) updatedPossibleMoves[row - 2][column - 1] = true;	
        }
      }
      if(board[row - 1] !== undefined && board[row - 1][column - 2] !== undefined) {
        if(emptySquare(board[row - 1][column - 2])) 
        {
          updatedPossibleMoves[row - 1][column - 2] = true;
        }
        else
        {
          const pieceFound:any = board[row - 1][column - 2];
          if(pieceFound.color !== piece.color) updatedPossibleMoves[row - 1][column - 2] = true;
        }
      }
      //SOUTHEAST
      if(board[row + 2] !== undefined && board[row + 2][column + 1] !== undefined) {
        if(emptySquare(board[row + 2][column + 1])) 
        {
          updatedPossibleMoves[row + 2][column + 1] = true;
        }
        else
        {
          const pieceFound:any = board[row + 2][column + 1];
          if(pieceFound.color !== piece.color) updatedPossibleMoves[row + 2][column + 1] = true;
        }
      }
      if(board[row + 1] !== undefined && board[row + 1][column + 2] !== undefined) {
        if(emptySquare(board[row + 1][column + 2])) 
        {
          updatedPossibleMoves[row + 1][column + 2] = true;
        }
        else
        {
          const pieceFound:any = board[row + 1][column + 2];
          if(pieceFound.color !== piece.color) updatedPossibleMoves[row + 1][column + 2] = true;
        }
      }
      //SOUTHWEST
      if(board[row + 2] !== undefined && board[row + 2][column - 1] !== undefined) {
        if(emptySquare(board[row + 2][column - 1])) 
        {
          updatedPossibleMoves[row + 2][column - 1] = true;
        }
        else
        {
          const pieceFound:any = board[row + 2][column - 1];
          if(pieceFound.color !== piece.color) updatedPossibleMoves[row + 2][column - 1] = true;
        }
      }
      
      if(board[row + 1] !== undefined && board[row + 1][column - 2] !== undefined) {
        if(emptySquare(board[row + 1][column - 2])) 
        {
          updatedPossibleMoves[row + 1][column - 2] = true;
        }
        else
        {
          const pieceFound:any = board[row + 1][column - 2];
          if(pieceFound.color !== piece.color) updatedPossibleMoves[row + 1][column - 2] = true;
        }
      }
      break;
    case 'pawn':
      if(piece.color === 1) {
        if(board[row - 1] !== undefined && board[row - 1][column] !== undefined) {
          if(emptySquare(board[row - 1][column])) 
          {
            updatedPossibleMoves[row - 1][column] = true;
          }
          if(board[row - 1] !== undefined && board[row - 1][column + 1] !== undefined) {
            if(!emptySquare(board[row - 1][column + 1])) {
              const pieceFound:any = board[row - 1][column + 1];
              if(pieceFound.color !== piece.color) updatedPossibleMoves[row - 1][column + 1] = true;
            }
          }
          if(board[row - 1] !== undefined && board[row - 1][column - 1] !== undefined) {
            if(!emptySquare(board[row - 1][column - 1])) {
              const pieceFound:any = board[row - 1][column - 1];
              if(pieceFound.color !== piece.color) updatedPossibleMoves[row - 1][column - 1] = true;
            }
          }
        }
        if(board[row - 2] !== undefined && board[row - 2][column] !== undefined && updatedPossibleMoves[row - 1][column] && piece.moves === 0) {
          if(emptySquare(board[row - 2][column])) 
          {
            updatedPossibleMoves[row - 2][column] = true;
          }
        }
        //EN PASSANT
        if(row === 3 && match.enPassant) {
        	if(board[row][column - 1] !== undefined) {
            if(!emptySquare(board[row][column - 1]) && board[row][column - 1].class === 'pawn' && board[row][column - 1].enPassant) {
              updatedPossibleMoves[row - 1][column - 1] = true;
            }
        	}
        	if(board[row][column + 1] !== undefined) {
            if(!emptySquare(board[row][column + 1]) && board[row][column + 1].class === 'pawn' && board[row][column + 1].enPassant) {
              updatedPossibleMoves[row - 1][column + 1] = true;
            }
        	}
        }
      } else {
        if(board[row + 1] !== undefined && board[row + 1][column] !== undefined) {
          if(emptySquare(board[row + 1][column])) 
          {
            updatedPossibleMoves[row + 1][column] = true;
          }
          if(board[row + 1] !== undefined && board[row + 1][column + 1] !== undefined) {
            if(!emptySquare(board[row + 1][column + 1])) {
              const pieceFound:any = board[row + 1][column + 1];
              if(pieceFound.color !== piece.color) updatedPossibleMoves[row + 1][column + 1] = true;
            }
          }
          if(board[row + 1] !== undefined && board[row + 1][column - 1] !== undefined) {
            if(!emptySquare(board[row + 1][column - 1])) {
              const pieceFound:any = board[row + 1][column - 1];
              if(pieceFound.color !== piece.color) updatedPossibleMoves[row + 1][column - 1] = true;
            }
          }
        }
        if(board[row + 2] !== undefined && board[row + 2][column] !== undefined && updatedPossibleMoves[row + 1][column] && piece.moves === 0) {
          if(emptySquare(board[row + 2][column])) 
          {
            updatedPossibleMoves[row + 2][column] = true;
          }
        }
        //EN PASSANT
        if (row === 4 && match.enPassant) {
        	if(board[row][column - 1] !== undefined) {
            if(!emptySquare(board[row][column - 1]) && board[row][column - 1].class === 'pawn' && board[row][column - 1].enPassant) {
              updatedPossibleMoves[row + 1][column - 1] = true;
            }
        	}
        	if(board[row][column + 1] !== undefined) {
            if(!emptySquare(board[row][column + 1]) && board[row][column + 1].class === 'pawn' && board[row][column + 1].enPassant) {
              updatedPossibleMoves[row + 1][column + 1] = true;
            }
        	}
        }
      }
      break;
    case 'queen':
      //SOUTHEAST
      i = 1;
      j = 1;
      while(true) {
        if(board[row + i] !== undefined && board[row + i][column + j] !== undefined) {
          if(emptySquare(board[row + i][column + j])) 
          {
            updatedPossibleMoves[row + i][column + j] = true;
          }
          else
          {
            const pieceFound:any = board[row + i][column + j];
            if(pieceFound.color !== piece.color) updatedPossibleMoves[row + i][column + j] = true;
            break;
          }
        } else {
          break;
        }
        i++;
        j++;
      }
      //SOUTHWEST
      i = 1;
      j = 1;
      while(true) {
        if(board[row + i] !== undefined && board[row + i][column - j] !== undefined) {
          if(emptySquare(board[row + i][column - j])) 
          {
            updatedPossibleMoves[row + i][column - j] = true;
          }
          else
          {
            const pieceFound:any = board[row + i][column - j];
            if(pieceFound.color !== piece.color) updatedPossibleMoves[row + i][column - j] = true;
            break;
          }
        } else {
          break;
        }
        i++;
        j++;
      }
      //NORTHEAST
      i = 1;
      j = 1;
      while(true) {
        if(board[row-i] !== undefined && board[row-i][column + j] !== undefined) {
          if(emptySquare(board[row-i][column + j])) 
          {
            updatedPossibleMoves[row-i][column + j] = true;
          }
          else
          {
            const pieceFound:any = board[row-i][column + j];
            if(pieceFound.color !== piece.color) updatedPossibleMoves[row-i][column + j] = true;
            break;
          }
        } else {
          break;
        }
        i++;
        j++;
      }
      //NORTHWEST
      i = 1;
      j = 1;
      while(true) {
        if(board[row - i] !== undefined && board[row - i][column - j] !== undefined) {
          if(emptySquare(board[row - i][column - j])) 
          {
            updatedPossibleMoves[row - i][column - j] = true;
          }
          else
          {
            const pieceFound:any = board[row - i][column - j];
            if(pieceFound.color !== piece.color) updatedPossibleMoves[row - i][column - j] = true;
            break;
          }
        } else {
          break;
        }
        i++;
        j++;
      }
      //SOUTH
      i = 1;
      while(true) {
        if(board[row + i] !== undefined && board[row + i][column] !== undefined) {
          if(emptySquare(board[row + i][column])) 
          {
            updatedPossibleMoves[row + i][column] = true;
          }
          else
          {
            const pieceFound:any = board[row + i][column];
            if(pieceFound.color !== piece.color) updatedPossibleMoves[row + i][column] = true;
            break;
          }
        } else {
          break;
        }
        i++;
      }
      //WEST
      i = 1;
      while(true) {
        if(board[row] !== undefined && board[row][column - i] !== undefined) {
          if(emptySquare(board[row][column - i])) 
          {
            updatedPossibleMoves[row][column - i] = true;
          }
          else
          {
            const pieceFound:any = board[row][column - i];
            if(pieceFound.color !== piece.color) updatedPossibleMoves[row][column - i] = true;
            break;
          }
        } else {
          break;
        }
        i++;
      }
      //NORTH
      i = 1;
      while(true) {
        if(board[row - i] !== undefined && board[row - i][column] !== undefined) {
          if(emptySquare(board[row - i][column])) 
          {
            updatedPossibleMoves[row - i][column] = true;
          }
          else
          {
            const pieceFound:any = board[row - i][column];
            if(pieceFound.color !== piece.color) updatedPossibleMoves[row - i][column] = true;
            break;
          }
        } else {
          break;
        }
        i++;
      }
      //EAST
      i = 1;
      while(true) {
        if(board[row] !== undefined && board[row][column + i] !== undefined) {
          if(emptySquare(board[row][column + i])) 
          {
            updatedPossibleMoves[row][column + i] = true;
          }
          else
          {
            const pieceFound:any = board[row][column + i];
            if(pieceFound.color !== piece.color) updatedPossibleMoves[row][column + i] = true;
            break;
          }
        } else {
          break;
        }
        i++;
      }

      break;
    case 'rook':
      //SOUTH
      i = 1;
      while(true) {
        if(board[row + i] !== undefined && board[row + i][column] !== undefined) {
          if(emptySquare(board[row + i][column])) 
          {
            updatedPossibleMoves[row + i][column] = true;
          }
          else
          {
            const pieceFound:any = board[row + i][column];
            if(pieceFound.color !== piece.color) updatedPossibleMoves[row + i][column] = true;
            break;
          }
        } else {
          break;
        }
        i++;
      }
      //WEST
      i = 1;
      while(true) {
        if(board[row] !== undefined && board[row][column - i] !== undefined) {
          if(emptySquare(board[row][column - i])) 
          {
            updatedPossibleMoves[row][column - i] = true;
          }
          else
          {
            const pieceFound:any = board[row][column - i];
            if(pieceFound.color !== piece.color) updatedPossibleMoves[row][column - i] = true;
            break;
          }
        } else {
          break;
        }
        i++;
      }
      //NORTH
      i = 1;
      while(true) {
        if(board[row - i] !== undefined && board[row - i][column] !== undefined) {
          if(emptySquare(board[row - i][column])) 
          {
            updatedPossibleMoves[row - i][column] = true;
          }
          else
          {
            const pieceFound:any = board[row - i][column];
            if(pieceFound.color !== piece.color) updatedPossibleMoves[row - i][column] = true;
            break;
          }
        } else {
          break;
        }
        i++;
      }
      //EAST
      i = 1;
      while(true) {
        if(board[row] !== undefined && board[row][column + i] !== undefined) {
          if(emptySquare(board[row][column + i])) 
          {
            updatedPossibleMoves[row][column + i] = true;
          }
          else
          {
            const pieceFound:any = board[row][column + i];
            if(pieceFound.color !== piece.color) updatedPossibleMoves[row][column + i] = true;
            break;
          }
        } else {
          break;
        }
        i++;
      }
      break;
  }
  
  return updatedPossibleMoves;
}
