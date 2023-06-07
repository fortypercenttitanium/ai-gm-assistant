export type FolderParams = {
  name: string;
  type: string;
  parent?: string;
};

export type ActorParams = {
  name: string;
  type: string;
  folder?: string;
};

export class FoundryHelper {
  static async getFolder(
    params: FolderParams,
    createIfNotFound = false,
  ): Promise<any> {
    const { name, type, parent } = params;
    const folder = game.folders.find(
      (f: any) =>
        f.name === name &&
        f.type === type &&
        (!f.parent || f.parent === parent),
    );

    if (folder || !createIfNotFound) return folder;

    return await FoundryHelper.createFolder(params);
  }

  static async createFolder(params: FolderParams) {
    const { name, type, parent } = params;

    return await Folder.create({
      name,
      type,
      parent,
    });
  }

  static async createActor(params: ActorParams, data: any) {
    return Actor.create(
      {
        ...params,
        ...data,
      },
      {
        render: true,
        renderSheet: true,
      },
    );
  }
}
