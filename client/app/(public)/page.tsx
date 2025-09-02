import { getSetupStatus } from "@/api/setupApi";

export default async function Home() {
  console.log(await getSetupStatus());

  return (
    <div>
      <h1></h1>
    </div>
  );
}
