// annyang.d.ts
declare module 'annyang' {
  interface CommandOption {
    smart?: boolean;
    regex?: RegExp;
  }

  interface AnnyangStatic {
    init(options?: { autoRestart?: boolean }): void;
    addCommands(
      commands: Record<string, () => void>,
      options?: CommandOption
    ): void;
    start(options?: { autoRestart?: boolean; continuous?: boolean }): void;
    abort(): void;
  }

  const annyang: AnnyangStatic;
  export default annyang;
}
