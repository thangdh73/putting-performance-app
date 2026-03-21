# MVP Implementation Plan

## Phase 1 – Project scaffolding
- create frontend using React + TypeScript + Vite
- set up Tailwind CSS
- create backend FastAPI app
- create SQLite database setup
- create basic folder structure
- create root and local README instructions

## Phase 2 – Backend foundation
- define models for User, Drill, Session, Attempt
- define Pydantic schemas
- create database initialisation logic
- add seed data for drill definitions
- implement basic REST routes

## Phase 3 – Scoring engine
- implement Broadie scoring rules
- implement Broadie average mode
- implement Broadie completion mode
- implement 100 ft drill scoring
- implement 4–8 ft drill scoring
- add unit tests

## Phase 4 – Frontend foundation
- set up routing
- build page shells
- create shared layout and navigation
- build Drill Library
- build Drill Detail

## Phase 5 – Session workflow
- build session creation flow
- build attempt entry UI
- build live scoring state
- save sessions to backend
- build summary page

## Phase 6 – History and analytics
- build history page
- add filter and sort
- build charts
- add benchmark comparison

## Phase 7 – Polish
- improve responsive layout
- improve validation and error handling
- refactor duplicated code
- ensure local setup works end to end
