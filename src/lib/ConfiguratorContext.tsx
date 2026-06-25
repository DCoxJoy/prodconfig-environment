'use client';

import React, { createContext, useContext, useReducer, useMemo } from 'react';
import {
  ConfiguratorState, Device, FeatureId, BundleItem, AppliedEdit,
} from '../types';
import { BP_IPHONE, BP_TABLET } from './catalog';
import { getDeviceFamily, isIphoneFamily, getAllowedFeatures } from './utils';

// ─── Actions ──────────────────────────────────────────────────────────────────

type Action =
  | { type: 'SET_DEVICE'; device: Device }
  | { type: 'SET_CERTIFIED'; certified: 'yes' | 'no' }
  | { type: 'CHANGE_CERTIFIED' }
  | { type: 'TOGGLE_FEATURE'; id: FeatureId }
  | { type: 'SET_SCENARIO'; key: string; value: string }
  | { type: 'SET_EDIT_NOTE'; note: string }
  | { type: 'ADD_APPLIED_EDIT'; edit: AppliedEdit }
  | { type: 'SET_LIVE_PRODUCTS'; products: BundleItem[] }
  | { type: 'SET_QTYS'; qtys: number[] }
  | { type: 'SET_BUNDLE_OPTION'; index: number }
  | { type: 'RESET' };

// ─── State ────────────────────────────────────────────────────────────────────

const initialState: ConfiguratorState = {
  device: null,
  certified: null,
  features: [],
  scenarios: {},
  editNote: '',
  appliedEdits: [],
};

interface FullState extends ConfiguratorState {
  liveProducts: BundleItem[] | null;
  qtys: number[];
  selectedBundleOption: number;
}

const initialFullState: FullState = {
  ...initialState,
  liveProducts: null,
  qtys: [1, 1, 1],
  selectedBundleOption: 0,
};

// ─── Reducer ──────────────────────────────────────────────────────────────────

function reducer(state: FullState, action: Action): FullState {
  switch (action.type) {
    case 'SET_DEVICE':
      return {
        ...state,
        device: action.device,
        certified: null,
        features: [],
        scenarios: {},
        editNote: '',
        appliedEdits: [],
        liveProducts: null,
        qtys: [1, 1, 1],
        selectedBundleOption: 0,
      };

    case 'SET_CERTIFIED':
      return { ...state, certified: action.certified };

    case 'CHANGE_CERTIFIED':
      return { ...state, certified: null, features: [] };

    case 'TOGGLE_FEATURE': {
      const family = getDeviceFamily(state.device?.id ?? '');
      const allowed = getAllowedFeatures(family);
      if (!allowed.includes(action.id)) return state;
      const idx = state.features.indexOf(action.id);
      const features = idx > -1
        ? state.features.filter(f => f !== action.id)
        : [...state.features, action.id];
      return { ...state, features };
    }

    case 'SET_SCENARIO':
      return {
        ...state,
        scenarios: { ...state.scenarios, [action.key]: action.value },
      };

    case 'SET_EDIT_NOTE':
      return { ...state, editNote: action.note };

    case 'ADD_APPLIED_EDIT':
      return {
        ...state,
        appliedEdits: [...state.appliedEdits, action.edit],
        editNote: '',
      };

    case 'SET_LIVE_PRODUCTS':
      return { ...state, liveProducts: action.products };

    case 'SET_QTYS':
      return { ...state, qtys: action.qtys };

    case 'SET_BUNDLE_OPTION':
      return {
        ...state,
        selectedBundleOption: action.index,
        liveProducts: null,
        qtys: [1, 1, 1],
      };

    case 'RESET':
      return { ...initialFullState };

    default:
      return state;
  }
}

// ─── Context ──────────────────────────────────────────────────────────────────

interface ContextValue {
  state: ConfiguratorState;
  liveProducts: BundleItem[];
  qtys: number[];
  selectedBundleOption: number;
  dispatch: React.Dispatch<Action>;
}

const ConfiguratorContext = createContext<ContextValue | null>(null);

export function ConfiguratorProvider({ children }: { children: React.ReactNode }) {
  const [fullState, dispatch] = useReducer(reducer, initialFullState);

  const liveProducts = useMemo(() => {
    if (fullState.liveProducts) return fullState.liveProducts;
    const family = getDeviceFamily(fullState.device?.id ?? '');
    const opts = isIphoneFamily(family) ? BP_IPHONE : BP_TABLET;
    const base = opts[fullState.selectedBundleOption] ?? opts[0];
    return base.items.map(item => ({ ...item }));
  }, [fullState.liveProducts, fullState.device, fullState.selectedBundleOption]);

  const value: ContextValue = {
    state: {
      device: fullState.device,
      certified: fullState.certified,
      features: fullState.features,
      scenarios: fullState.scenarios,
      editNote: fullState.editNote,
      appliedEdits: fullState.appliedEdits,
    },
    liveProducts,
    qtys: fullState.qtys,
    selectedBundleOption: fullState.selectedBundleOption,
    dispatch,
  };

  return (
    <ConfiguratorContext.Provider value={value}>
      {children}
    </ConfiguratorContext.Provider>
  );
}

export function useConfigurator(): ContextValue {
  const ctx = useContext(ConfiguratorContext);
  if (!ctx) throw new Error('useConfigurator must be used inside ConfiguratorProvider');
  return ctx;
}
