import { Store } from "redux"
import { IState } from "../interfaces/state"
import { configureStore } from "@reduxjs/toolkit"
import { mainReducer } from "../reducers"
import { SelectedListener, StartNodeListener } from "../interfaces/listeners"
import { IWorkFlowNode } from "../interfaces"
import { Action, ActionType, AddNodeAction, SelectNodeAction } from "../actions"
import { INodeMaterial } from "../interfaces/material"

export class EditorStore {
  store: Store<IState>
  materials: INodeMaterial[] = []
  constructor(debugMode?: boolean,) {
    this.store = makeStoreInstance(debugMode || false)
  }

  dispatch = (action: Action) => {
    this.store.dispatch(action)
  }

  addNode(parentId: string, node: IWorkFlowNode) {
    const addAction: AddNodeAction = { type: ActionType.ADD_NODE, payload: { parentId, node } }
    console.log("哈哈 addNode ", addAction)
    this.store.dispatch(addAction)
  }

  selectNode(id: string | undefined) {
    const selectAction: SelectNodeAction = { type: ActionType.SELECT_NODE, payload: { id } }
    this.store.dispatch(selectAction)
  }

  subscribeStartNodeChange(listener: StartNodeListener) {
    let previousState: IWorkFlowNode | undefined = this.store.getState().startNode

    const handleChange = () => {
      const nextState = this.store.getState().startNode
      if (nextState === previousState) {
        return
      }
      previousState = nextState
      listener(nextState)
    }

    return this.store.subscribe(handleChange)
  }


  subscribeSelectedChange(listener: SelectedListener) {
    let previousState: string | undefined = this.store.getState().selectedId

    const handleChange = () => {
      const nextState = this.store.getState().selectedId
      if (nextState === previousState) {
        return
      }
      previousState = nextState
      listener(nextState)
    }

    return this.store.subscribe(handleChange)
  }
}

function makeStoreInstance(debugMode: boolean): Store<IState> {
  // TODO: if we ever make a react-native version of this,
  // we'll need to consider how to pull off dev-tooling
  const reduxDevTools =
    typeof window !== 'undefined' &&
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any).__REDUX_DEVTOOLS_EXTENSION__
  return configureStore(
    {
      reducer: mainReducer,
      middleware: (getDefaultMiddleware) => getDefaultMiddleware({
        immutableCheck: false,
        serializableCheck: false,
      }),
      devTools: debugMode &&
        reduxDevTools &&
        reduxDevTools({
          name: 'dnd-core',
          instanceId: 'dnd-core',
        }),
    }
  )
}
