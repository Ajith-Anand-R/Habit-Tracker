# Phase 2 Plan: Data Layer, UI, and Phase 2 Implementation

Note: Phase 1 delivered scaffolding, interfaces, Redux skeleton, and navigation blueprint. This document outlines Phase 2 objectives, concrete tasks, and acceptance criteria.

Objectives
- Implement SQLite-backed data layer (real Expo SQLite) and wire into Redux thunks.
- Complete Habit and Completion repositories with concrete SQL queries and migrations plan.
- Build UI screens wired to data layer: HabitForm, HabitDetail, Home, Calendar, Analytics.
- Ensure TypeScript typings across domain models and repositories are consistent.
- Maintain offline-first behavior and phase-appropriate tests.

Phase 2 Scoping
- Phase 2A: DB schema and initial migrations for habits and completions.
- Phase 2B: Concrete repository implementations using expo-sqlite wrapper.
- Phase 2C: Basic UI wiring for Habit CRUD and completions.
- Phase 2D: Basic unit tests for repository integration and streak logic scaffolds.

Data Model Recap (Phase 2 implementation will strictly follow this)
- Habit Table
  - id: string (primary key)
  - title: string
  - description: string
  - type: string
  - target: integer
  - color: string
  - icon: string
  - startDate: date
  - reminderTime: time (nullable)
- Completion Table
  - id: string
  - habitId: string (foreign key)
  - date: date
  - count: integer

- Phase 2 Deliverables
- SQLite data layer implemented with DB wrappers (expo-sqlite).
- HabitRepositoryImpl and CompletionRepositoryImpl fully implemented with CRUD and queries.
- Redux thunks for loading, creating, updating, and deleting habits wired; on success, state updates accordingly.
- HabitFormScreen and HabitDetailScreen scaffolds implemented for Phase 3 wiring.
- Phase 2 tests scaffolding prepared (streak analytics, repository tests).
- Phase 3 wiring plan: Hook UI to data layer for Habit CRUD and completions, and update streaks logic accordingly.
- memory.md updated with Phase 2 recap and Phase 3 plan (see memory.md).
- Phase 4: Calendar view and per-date status; lazy calendar data loading; per-date modal for habit statuses.
- SQLite data layer implemented with DB wrappers (expo-sqlite).
- HabitRepositoryImpl and CompletionRepositoryImpl fully implemented with CRUD and queries.
- Redux thunks for loading, creating, updating, and deleting habits wired; on success, state updates accordingly.
- HabitFormScreen and HabitDetailScreen scaffolds implemented for Phase 3 wiring.
- Phase 2 tests scaffolding prepared (streak analytics, repository tests).
- Phase 3 wiring plan: Hook UI to data layer for Habit CRUD and completion tracking, and update streaks logic accordingly.
- memory.md updated with Phase 2 recap and Phase 3 plan (see memory.md).
