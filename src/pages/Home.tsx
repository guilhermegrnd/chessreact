import React, { useState, useEffect } from 'react';
import Piece from '../components/Piece';
import Modal from '../components/Modal';
import { emptySquare, checkPossibleMoves, executePlay } from '../functions/Rules';

function Home() {

	const _possibleMoves = [
		[ false, false, false, false, false, false, false, false ],
		[ false, false, false, false, false, false, false, false ],
		[ false, false, false, false, false, false, false, false ],
		[ false, false, false, false, false, false, false, false ],
		[ false, false, false, false, false, false, false, false ],
		[ false, false, false, false, false, false, false, false ],
		[ false, false, false, false, false, false, false, false ],
		[ false, false, false, false, false, false, false, false ]
	];

	const _board = [
		[{},{},{},{},{},{},{},{}],
		[{},{},{},{},{},{},{},{}],
		[{},{},{},{},{},{},{},{}],
		[{},{},{},{},{},{},{},{}],
		[{},{},{},{},{},{},{},{}],
		[{},{},{},{},{},{},{},{}],
		[{},{},{},{},{},{},{},{}],
		[{},{},{},{},{},{},{},{}]
	];

	const _match = {
		gameOver: false,
		check: false,
		checkMate: false,
		onMove: false,
		currentPlayer: 1,
		started: false,
		enPassant: false
	};

	const _modal = {
		show: false,
		message: ''
	};
	
	const [match, setMatch] = useState(_match);

	const [pieceSelected,setPieceSelected]:[pieceSeleceted:any,setPieceSelected:Function] = useState({});

	const [modal,setModal] = useState(_modal);

	const [blackPiecesTaken, setBlackPiecesTaken]:[blackPiecesTaken:any,setBlackPiecesTaken:Function] = useState([]);

	const [whitePiecesTaken, setWhitePiecesTaken]:[whitePiecesTaken:any,setWhitePiecesTaken:Function] = useState([]);

	const [possibleMoves, setPossibleMoves] = useState(_possibleMoves);

	const [board, setBoard] = useState(_board);

	const handleMove = (selectedSquare:any) => {
		if(match.gameOver) {
			return {
				field: 'handleMove',
				error: 'Match has Ended'
			};
		}

		const { row, column } = selectedSquare;
		if(emptySquare(board[row][column])) {
			setPieceSelected({});
			return {
				field: 'handleMove',
				error: 'No Piece in the square'
			};
		}

		const updatedPieceSelected:any = { ...board[row][column], row, column };
		if(updatedPieceSelected.color !== match.currentPlayer) {
			setPieceSelected({});
			return {
				field: 'handleMove',
				error: 'Not your turn'
			};
		}

		setPieceSelected(updatedPieceSelected);
		const updatedPossibleMoves = checkPossibleMoves(selectedSquare, board, match);
		setPossibleMoves(updatedPossibleMoves);
		setMatch({...match, onMove: true});
	}

	const makeMoveNew = (square:any) => {
		if(match.gameOver) {
			return {
				field: 'makeMoveNew',
				error: 'Match has Ended'
			};
		}

		const { updatedBoard, updatedMatch, updatedModal, updatedBlackPiecesTaken, updatedWhitePiecesTaken  } = executePlay(board,possibleMoves,{...match},{...pieceSelected},square);

		setBoard(updatedBoard);
		setBlackPiecesTaken([ ...blackPiecesTaken, ...updatedBlackPiecesTaken]);
		setWhitePiecesTaken([ ...whitePiecesTaken, ...updatedWhitePiecesTaken]);
		setModal({ ...modal, ...updatedModal });
		setMatch({ ...match, ...updatedMatch });
		setPieceSelected({});
		setPossibleMoves(_possibleMoves);
	};

	const startGame = () => {
		
		setMatch({ ..._match, started: true });
		setPieceSelected({});
		setModal(_modal);
		setBlackPiecesTaken([]);
		setWhitePiecesTaken([]);
		setPossibleMoves(_possibleMoves);
		
		const __board:any = [
			[{ class: 'rook', color: 0, moves: 0 }, { class: 'knight', color: 0, moves: 0 }, { class: 'bishop', color: 0, moves: 0 }, { class: 'queen', color: 0, moves: 0 }, { class: 'king', color: 0, moves: 0 }, { class: 'bishop', color: 0, moves: 0 }, { class: 'knight', color: 0, moves: 0 }, { class: 'rook', color: 0, moves: 0 }],
			[{ class: 'pawn', color: 0, moves: 0 }, { class: 'pawn', color: 0, moves: 0 }, { class: 'pawn', color: 0, moves: 0 }, { class: 'pawn', color: 0, moves: 0 }, { class: 'pawn', color: 0, moves: 0 }, { class: 'pawn', color: 0, moves: 0 }, { class: 'pawn', color: 0, moves: 0 }, { class: 'pawn', color: 0, moves: 0 }],
			[{},{},{},{},{},{},{},{}],
			[{},{},{},{},{},{},{},{}],
			[{},{},{},{},{},{},{},{}],
			[{},{},{},{},{},{},{},{}],
			[{ class: 'pawn', color: 1, moves: 0 }, { class: 'pawn', color: 1, moves: 0 }, { class: 'pawn', color: 1, moves: 0 }, { class: 'pawn', color: 1, moves: 0 }, { class: 'pawn', color: 1, moves: 0 }, { class: 'pawn', color: 1, moves: 0 }, { class: 'pawn', color: 1, moves: 0 }, { class: 'pawn', color: 1, moves: 0 }],
			[{ class: 'rook', color: 1, moves: 0 }, { class: 'knight', color: 1, moves: 0 }, { class: 'bishop', color: 1, moves: 0 }, { class: 'queen', color: 1, moves: 0 }, { class: 'king', color: 1, moves: 0 }, { class: 'bishop', color: 1, moves: 0 }, { class: 'knight', color: 1, moves: 0 }, { class: 'rook', color: 1, moves: 0 }]
		]
		setBoard(__board);
	};

	useEffect(() => {
		if(modal.show) {
			setTimeout(() => {
				setModal({
					...modal,
					show: !modal.show,
					message: ``
				});
			},1000);
		}
	},[modal])

	return (
		<div>
			<div style={{ display: 'flex', flexDirection: 'column', width: '400px', height: '400px' }}>
			{
				board.map((row,i) => (
					<div 
						style={{ display: 'flex', width: '100%', height: '80px' }}
						key={`${i}`}
					>
						{
							row.map((column,j) => (
								<div 
									style={{
										width: '17.5%',
										height: '50px',
										display: 'flex',
										justifyContent: 'center',
										alignItems: 'center',
										backgroundColor: 
											(match.onMove) ?
												(possibleMoves[i][j]) ?
													'#d3d3d3'
												:
													(i % 2 === 1) ?
														(j % 2 === 0) ? '#B88B4A' : '#E3C16F'
													:
														(j % 2 === 0) ? '#E3C16F' : '#B88B4A'
											:
												(i % 2 === 1) ?
													(j % 2 === 0) ? '#B88B4A' : '#E3C16F'
												:
													(j % 2 === 0) ? '#E3C16F' : '#B88B4A'
									}}
									onClick={
										(match.onMove) ?
											() => makeMoveNew({ ...column, row:i,column:j})
										:
											() => handleMove({ ...column, row:i,column:j})
									}
									key={`${i}-${j}`}
								>
									{
										!emptySquare(column) ? <Piece piece={column} /> : ''
									}
								</div>
							))
						}
					</div>
				))
			}
			</div>
			<div style={{ display: 'flex', width: '400px', height: '20px', backgroundColor: '#fff' }}>
				{
					blackPiecesTaken.map((piece:any,i:number) => (
						<Piece piece={piece} key={i} />
					))
				}
			</div>
			<div style={{ display: 'flex', width: '400px', height: '20px', backgroundColor: '#000' }}>
				{
					whitePiecesTaken.map((piece:any,i:number) => (
						<Piece piece={piece} key={i}/>
					))
				}
			</div>
			{
				match.started	? '' : <button onClick={() => { startGame() }}>New Game</button>
			}
			<Modal 
				onClose={() => { setModal({ ...modal, show: false })}} 
				show={modal.show}
			>
				{modal.message}
			</Modal>
		</div>
  );
}

export default Home;
