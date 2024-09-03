import { ActionFunction, json } from "@remix-run/node";
import { getUser, requireUserId } from "~/utils/auth.server";
import { uploadAvatar } from "~/utils/s3.server";
import { prisma } from "~/utils/prisma.server";

export const action: ActionFunction = async ({ request }) => {
  // 1
  const userId = await requireUserId(request);
  // 2
  const imageUrl = await uploadAvatar(request);

  const infoUser = await getUser(request);

  // 3
  await prisma.user.update({
    where: {
      id: userId,
    },
    data: {
      profile: {
        firstName: infoUser?.profile?.firstName!,
        lastName: infoUser?.profile?.lastName!,
        department: infoUser?.profile?.department,
        profilePicture: imageUrl?.toString(),
      },
    },
  });

  // 4
  return json({ imageUrl });
};
