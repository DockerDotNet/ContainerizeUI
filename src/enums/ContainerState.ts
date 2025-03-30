export enum StatusEnum {
  /// <summary>
  /// Enum Created for value: created
  /// </summary>
  Created = 1,

  /// <summary>
  /// Enum Running for value: running
  /// </summary>
  Running = 2,

  /// <summary>
  /// Enum Paused for value: paused
  /// </summary>
  Paused = 3,

  /// <summary>
  /// Enum Restarting for value: restarting
  /// </summary>
  Restarting = 4,

  /// <summary>
  /// Enum Removing for value: removing
  /// </summary>
  Removing = 5,

  /// <summary>
  /// Enum Exited for value: exited
  /// </summary>
  Exited = 6,

  /// <summary>
  /// Enum Dead for value: dead
  /// </summary>
  Dead = 7,
}

export const statusBadgeMap: Record<StatusEnum, "success" | "warning" | "default" | "error" | "processing"> = {
    [StatusEnum.Created]: "default",
    [StatusEnum.Running]: "success",
    [StatusEnum.Paused]: "warning",
    [StatusEnum.Restarting]: "processing",
    [StatusEnum.Removing]: "default",
    [StatusEnum.Exited]: "error",
    [StatusEnum.Dead]: "error",
  };

